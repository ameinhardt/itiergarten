/* eslint-disable unicorn/no-process-exit, eslint-comments/disable-enable-pair */
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import Router from '@koa/router';
import Koa, { Context, Next } from 'koa';
import compress from 'koa-compress';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import helmet from 'koa-helmet';
import send from 'koa-send';
import serve from 'koa-static';
import { initMongo } from './db';
import healthcheck from './healthcheck';
import logger from './logger';
import initRouter from './routes';

const PORT = (process.env.PORT && Number.parseInt(process.env.PORT)) || 8080,
  NAME = process.env.NAME || 'itiergarten',
  VERSION = process.env.VERSION || 'development',
  PROXY = process.env.PROXY === 'true',
  ORIGIN = process.env.ORIGIN,
  EXITSIGNALS = ['SIGINT', 'SIGTERM'],
  // eslint-disable-next-line unicorn/no-array-reduce
  IPs = Object.values(os.networkInterfaces()).reduce(
    (l: Array<string>, iface?: os.NetworkInterfaceInfo[]) =>
      iface
        ? [...l, ...iface.filter(({ family }) => family === 'IPv4' /* && !internal */).map(({ address }) => address)]
        : l,
    [] as Array<string>
  );

if (typeof process.env.ORIGIN !== 'string') {
  throw new TypeError('specify ORIGIN envvar');
}

let HTTPS_CERT: string,
  HTTPS_KEY: string,
  HTTPS_HSTS: boolean,
  useSSL = false;

if (process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
  try {
    HTTPS_CERT = fs.readFileSync(path.resolve(process.env.HTTPS_CERT), 'utf8').toString();
    HTTPS_KEY = fs.readFileSync(path.resolve(process.env.HTTPS_KEY), 'utf8').toString();
    useSSL = true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(error);
    }
  }
  HTTPS_HSTS = process.env.HTTPS_HSTS ? process.env.HTTPS_HSTS.toLowerCase() !== 'false' : true;
}

process
  .on('uncaughtExceptionMonitor', (error, origin) => {
    logger.error(`Uncaught exception: ${error}, origin: ${origin}`);
    process.exit(1);
  })
  .on('unhandledRejection', (error, origin) => {
    logger.error(`Unhandled rejection: ${error}, origin: ${origin}`);
    process.exit(1);
  });

async function errorHandler(context: Context, next: Next) {
  // global error handling first
  try {
    await next();
  } catch (error) {
    let status = 500,
      details,
      message;
    if (error instanceof Object) {
      const errorObject = error as Record<string, unknown>;
      status = typeof errorObject.status === 'number' ? errorObject.status : 500;
      message = errorObject.message;
      details = errorObject.details;
      logger.error(
        `${context.method} ${context.path} from ${context.request.get('X-Client-IP') || context.request.ip}: ${message} (${status})`
      );
      if (details) {
        logger.info(`details: ${details}`);
      }
      message = error instanceof Error && typeof error.message === 'string' ? error.message : 'unexpected error';
      context.status = status;
    } else {
      context.app.emit('error', error, context);
    }
    switch (context.accepts('json', 'html')) {
      case 'json': {
        const body: Record<string, unknown> = {
          result: 'error',
          message,
          status
        };
        if (process.env.NODE_ENV !== 'production') {
          body.details = details;
        }
        context.body = body;
        break;
      }
      case 'html': {
        logger.debug(`Error, accepts html, forward to /: ${message}`);
        if (message) {
          context.redirect(`${ORIGIN}/?error=${encodeURIComponent(message)}`);
        } else {
          context.redirect(`${ORIGIN}`);
        }
        break;
      }
      default: {
        context.body = message;
        break;
      }
    }
  }
}

async function initApp(staticRoot = './static'): Promise<Koa<Koa.DefaultState, Koa.DefaultContext & Koa.Context & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>>> {
  const apiPath = '/api',
    authPath = `${apiPath}/auth`,
    isIndex = /^.*\/(index\.html)?(\?.*)?$/,
    maxage = 365 * 24 * 60 * 60 * 1000,
    app = new Koa(),
    serveStaticMiddleware = serve(staticRoot, { maxage }),
    securityHeaderMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          // defaultSrc should include: child-src, connect-src, font-src, frame-src, img-src, manifest-src, media-src, object-src, prefetch-src, script-src, script-src-elem, script-src-attr, style-src, style-src-elem, style-src-attr, worker-src
          'default-src': ["'self'"],
          'base-uri': ["'self'"],
          'connect-src': ["'self'"],
          'form-action': ["'self'"],
          'frame-src': ["'none'"],
          'frame-ancestors': ["'none'"],
          'script-src': ["'self'", "'sha256-G3b4OOW/9PWDPKCEfEvjuiYzcm0TPRC7GmhWp4U548M='"],
          'img-src': ["'self'"],
          'script-src-attr': ["'none'"],
          'style-src': ["'self'", "'sha256-GqeUjWVt2JyfHy42oTCcbm2MvVMewi3SI4bayfIqK/I='"],
          'object-src': ["'none'"],
          // 'require-trusted-types-for': ["'script'"],
          ...(process.env.NODE_ENV !== 'development' && { 'upgrade-insecure-requests': [] })
        }
      },
      hsts: HTTPS_HSTS
    });
  app.proxy = PROXY;
  return (
    app
      .use(errorHandler)
      .use(conditional())
      .use(etag())
      .use(securityHeaderMiddleware)
      .use(
        compress({
          threshold: 10 * 1024
        })
      )
      // exclude index.html from static files first
      .use((context, next) =>
        !(context.path.startsWith(`${apiPath}/`) || ~context.path.search(isIndex))
          ? serveStaticMiddleware(context, next)
          : next()
      )
      .use(async (context: Context, next: Next) => {
        if (context.path === '/' && context.query.code && context.query.state) { // session_state for some oauth provider
          // looks like a callback - redirect to defai;t callback url
          return context.redirect(`${ORIGIN}${authPath}/google/callback?${context.querystring}`);
        }
        if (!context.path.startsWith(`${apiPath}/`) && context.accepts('html') && ['HEAD', 'GET'].includes(context.method)) {
          return send(context, 'index.html', { maxage, root: path.resolve(staticRoot) });
        }
        return next();
      })
      .use(await initRouter(apiPath))
  );
}

/* istanbul ignore next */
async function main(staticRoot: string) {
  const [app, mongo] = await Promise.all([initApp(staticRoot), initMongo()]),
    server = (
      useSSL
        ? https.createServer(
          {
            key: HTTPS_KEY,
            cert: HTTPS_CERT
          },
          app.callback()
        )
        : http.createServer(app.callback())
    ).listen(PORT, () => {
      logger.info(
        `${NAME} (v${VERSION}, ${process.env.NODE_ENV}, ssl ${
          useSSL ? 'enabled' : 'disabled'}, hsts ${
          HTTPS_HSTS ? 'enabled' : 'disabled'}) started on port ${PORT}`
      );
      logger.debug(['IPs:', ...IPs.map((ip) => `${useSSL ? 'https' : 'http'}://${ip}:${PORT}`)]);
    }),
    healthserver = healthcheck(useSSL, PORT),
    cleanup = async () => {
      logger.info('shutting down');
      for (const signal of EXITSIGNALS) {
        process.off(signal, cleanup).on(signal, () => {
          logger.error('forced kill after repeated signal');
          process.exit(1);
        });
      }
      setTimeout(() => {
        logger.error('forced kill after timeout');
        process.exit(1);
      }, 3000);
      try {
        if (mongo) {
          await mongo.close();
          logger.debug('mongodb');
        }
        if (healthserver) {
          await promisify(healthserver.close.bind(healthserver))();
          logger.debug('health');
        }
        await promisify(server.close.bind(server))();
        logger.debug('app');
      } catch (error) {
        let reason = '';
        if (error instanceof Error) {
          reason = error.message;
        } else if (typeof error === 'string') {
          reason = error;
        }
        logger.error(`cleanup failed ${reason}`);
      }
      return new Promise((resolve) => setTimeout(resolve, 100));
    };

  app.on('error', (error, context) => {
    logger.error(`${context.method} ${context.path} from ${context.request.ip}:\n${error.stack}`);
  });
  for (const signal of EXITSIGNALS) {
    process.once(signal, async () => {
      await cleanup();
      process.exit();
    });
  }

  return app;
}

export default main;
export {  initApp };

/* if (require.main === module) {
  main();
} */

export { default as logger } from './logger';
