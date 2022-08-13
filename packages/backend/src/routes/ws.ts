import crypto, { BinaryLike } from 'node:crypto';
import { Context, DefaultState, Middleware, Next } from 'koa';
import compose from 'koa-compose';
import type { ChangeStream, ChangeStreamDocument, ChangeStreamInsertDocument, Collection, Document } from 'mongodb';
import mongoose from 'mongoose';
import WebSocket, { ServerOptions } from 'ws';
import { AuthContext, initAuthContext } from '../auth';
import logger from '../logger';

interface ClientRefreshToken extends Document  {
  type: 'refreshToken'
  _ts: Date
  oldTokenHash: string
  newTokenHash: string
}

interface ClientLogout extends Document {
  type: 'logout'
  _ts: Date
  tokenHash: string
}

interface ClientMessage extends Document {
  type: 'message'
  _ts: Date
  sourceId: string
  target?: string
  data: unknown
}

type Message = ClientRefreshToken | ClientLogout | ClientMessage

interface SynchedWebSocket extends WebSocket {
  isAlive: boolean;
  id: string;
  tokenHash: string
}

function getHash(data: BinaryLike) {
  return crypto.createHash('sha256').update(data).digest('base64');
}

const HEARTBEATINTERVAL = 5 * 1000,
  COLLECTION = 'ws-events';

function initStream(wss: WebSocket.Server<SynchedWebSocket>, collection: Collection<Message>) : Collection<Message> {
  let changeStream : ChangeStream | undefined;

  async function destroyChangeStream() {
    logger.debug('destroying change stream');
    if (!changeStream) {
      return;
    }
    // destroy quick to avoid race condition
    const destroyableChangeStream = changeStream;
    changeStream = undefined;
    destroyableChangeStream.removeAllListeners('close');
    destroyableChangeStream.removeAllListeners('change');
    destroyableChangeStream.removeAllListeners('error');
    if (!destroyableChangeStream.closed) {
      await destroyableChangeStream.close();
    }
    logger.debug('change stream destroyed');
  }

  async function createChangeStream() {
    if (changeStream) {
      await destroyChangeStream();
    }
    if (wss.clients.size === 0) {
      logger.info('no clients, no need to create change stream');
      return;
    }
    logger.debug('creating change stream');
    if (!collection) {
      logger.error('no changestream without collection');
      return;
    }
    // for cosmosdb: special watch(), doesn't include operationType
    changeStream = collection
      .watch([
        { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } },
        { $project: { _id: 1, fullDocument: 1, ns: 1, documentKey: 1 } }
      ],
      { fullDocument: 'updateLookup' })
      .on('change', (document: ChangeStreamInsertDocument<Message>) => {
        // if (document.operationType === 'insert') {
        switch (document.fullDocument.type) {
          case 'message': {
            for (const client of wss.clients) {
              if (document.fullDocument.sourceId === client.id) {
                continue;
              }
              if (!document.fullDocument.target || client.id === document.fullDocument.target) {
                client.send(JSON.stringify(document.fullDocument.data), { binary: false });
              }
            }
            break;
          }
          case 'refreshToken': {
            for (const client of wss.clients) {
              if (client.tokenHash === document.fullDocument.oldTokenHash) {
                client.tokenHash = document.fullDocument.newTokenHash;
              }
            }
            break;
          }
          case 'logout': {
            for (const client of wss.clients) {
              if (client.tokenHash === document.fullDocument.tokenHash) {
                client.close();
              }
            }
            break;
          }
        // No default
        } /* else if (event.operationType === 'delete') {
        const deletedDocument = event as ChangeStreamDeleteDocument;
      } */
      })
      .on('error', (error: Error) => {
        logger.error(`ws change stream encountered an error: ${error.message}`);
      })
      .on('close', () => {
        if (mongoose.connection.readyState === mongoose.STATES.connected) {
          logger.warn('ws change stream was closed, scheduling reconnection...');
          setTimeout(() => {
            createChangeStream();
          }, 1000);
        } else {
          mongoose.connection.on('connected', () => {
            createChangeStream();
          });
        }
      });

    logger.debug('change stream started');
  }

  wss
    .on('close', destroyChangeStream)
    .on('connection', (ws) => {
      ws
        .on('close', () => {
          if (wss.clients.size === 0) {
            destroyChangeStream();
          }
        })
        .on('message', async (payload, isBinary) => {
          if (isBinary) {
            return;
          }
          try {
            const data = JSON.parse(payload.toString());
            await collection.insertOne({
              type: 'message',
              _ts: new Date(),
              sourceId: ws.id,
              data
            });
          } catch {
            logger.error('received data couldn\'t be interpreted');
          }
        });
      createChangeStream();
    });

  return collection;
}

function initHeartbeat(wss: WebSocket.Server<SynchedWebSocket>) {
  let interval: ReturnType<typeof setInterval>  | undefined;

  function startPingPong() {
    if (!interval) {
      interval = setInterval(() => {
        // logger.debug(`interval ping/pong for ${wss.clients.size} clients`);
        for (const ws of wss.clients) {
          if (ws.isAlive === false) {
            logger.info('ws client seems dead - terminating');
            ws.terminate(); continue;
          }
          ws.isAlive = false;
          ws.ping();
        }
      }, HEARTBEATINTERVAL);
    }
    return interval;
  }

  function stopPingPong() {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  wss.on('close', stopPingPong);
  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      // logger.debug('ws client alive!');
      ws.isAlive = true;
    }).on('close', () => {
      if (wss.clients.size === 0) {
        stopPingPong();
      }
    });
    startPingPong();
  });
}

class TokenWebSocketServer extends WebSocket.Server<SynchedWebSocket>  {
  constructor(collection: Collection<Message>, options?: ServerOptions, callback?: () => void) {
    super(options, callback);
    this.collection = collection;
    initStream(this, this.collection);
    initHeartbeat(this);
  }

  collection: Collection<Message>;

  refreshToken(oldToken: string, newToken: string) {
    return this.collection.insertOne({
      type: 'refreshToken',
      _ts: new Date(),
      oldTokenHash: getHash(oldToken),
      newTokenHash: getHash(newToken)
    } as ClientRefreshToken);
  }

  logout(accessToken : string) {
    return this.collection.insertOne({
      type: 'logout',
      _ts: new Date(),
      tokenHash: getHash(accessToken)
    } as ClientLogout);
  }

  getMiddleware() : Middleware<DefaultState, Context> {
    return compose([
      initAuthContext(false, false),
      async (context: AuthContext, next: Next) => {
        const upgradeHeader = (context.request.headers.upgrade || '').split(',').map((s) => s.trim().toLowerCase());
        if (~upgradeHeader.indexOf('websocket') && context.state.token) {
          logger.debug(`requesting ws middleware on route ${context.path}`);
          const ws: SynchedWebSocket = await new Promise((resolve) =>
            this.handleUpgrade(context.req, context.request.socket, Buffer.alloc(0), resolve)
          );
          ws.tokenHash = getHash(context.state.token);
          ws.id = crypto.randomUUID();
          this.emit('connection', ws, context.req);
          context.respond = false;
        } else {
          return next();
        }
      }
    ]);
  }
}

async function init(): Promise<TokenWebSocketServer> {
  logger.debug('creating collection bus');
  let collection : Collection<Message> | undefined;

  try {
    collection = await mongoose.connection.createCollection<Message>(COLLECTION, {
      capped: true,
      size: 1e6, // max 1 MB
      max: 1000 // in message count
    });
    logger.info(`created new collection '${COLLECTION}'`);
  } catch {
    logger.info('collection seem to exist already');
    collection = mongoose.connection.collection(COLLECTION);
    /* const isCapped = await collection.isCapped();
    if (!isCapped) {
      throw new Error(`existing collection '${COLLECTION}' is not capped`);
    }
    logger.debug(`capped collection '${COLLECTION}' exists`);
    */
  }
  await collection.createIndex(
    { _ts: 1 },
    { expireAfterSeconds: 60, background: true }
  );

  logger.info('initializing websocket server');
  return new TokenWebSocketServer(collection, {
    noServer: true,
    clientTracking: true,
    maxPayload: 100 * 1024 // 100kb
  });
}

export default init;
export type { TokenWebSocketServer };
