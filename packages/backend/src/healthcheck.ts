import fs from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import path from 'node:path';
import logger from './logger';

/* const rawCert = process.env.HTTPS_CERT
  ? Buffer.from(
    fs.readFileSync(path.resolve(process.env.HTTPS_CERT), 'utf8')
      .toString()
      .match(/-----BEGIN CERTIFICATE-----\s*([\s\S]+?)\s*-----END CERTIFICATE-----/i)[1],
    'base64'
  )
  : null;
*/

const HEALTHPORT = process.env.HEALTHPORT ? Number.parseInt(process.env.HEALTHPORT, 10) : undefined;

async function checkServer(useSSL: boolean, port: number) {
  const start = process.hrtime.bigint(),
    response: http.IncomingMessage = await new Promise((resolve, reject) => {
      try {
        useSSL
          ? https.get(
            {
              port,
              ca: fs.readFileSync(path.resolve(process.env.HTTPS_CERT as string), 'utf8').toString()
            },
            resolve
          )
          : http.get({ port }, resolve);
      } catch (error) {
        reject(error);
      }
    }),
    end = process.hrtime.bigint();
  response.resume();
  return {
    up: response.statusCode === 200,
    time: Number(end - start) / 1_000_000
  };
}

interface HealthStatus {
  [k: string]: unknown;
}

function send(response: http.ServerResponse, code: number, body: unknown) {
  const string_ = JSON.stringify(body);
  return response
    .writeHead(code, {
      'Content-Type': 'application/json',
      Connection: 'close',
      'Content-Length': Buffer.byteLength(string_)
    })
    .end(string_);
}

export default (useSSL = false, targetPort = 8080) => {
  if (HEALTHPORT === undefined || Number.isNaN(HEALTHPORT)) {
    return null;
  }
  const host = 'localhost',
    port = HEALTHPORT;
  return http
    .createServer(async (request, response) => {
      const body: Record<string, HealthStatus> = {};
      try {
        body.server = await checkServer(useSSL, targetPort);
      } catch (error) {
        if (error instanceof Error) {
          send(response, 500, {
            message: error.message
          });
        }
      }
      send(response, Object.values(body).every(({ up }) => up) ? 200 : 500, body);
      // req.socket.destroy();
    })
    .listen({ port, host }, () => {
      logger.info(`healthserver started on http://${host}:${port}`);
    });
};
