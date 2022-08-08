import Router from '@koa/router';
import jsonwebtoken from 'jsonwebtoken';
import { Context } from 'koa';
import compose from 'koa-compose';
import auth, { AuthContext, initAuthContext } from '../auth';
import documentation from './documentation';
import user from './user';
import initWs from './ws';

if (typeof process.env.RESPONSIBLE !== 'string' ||
  typeof process.env.ORIGIN !== 'string' ||
  typeof process.env.AUTH_PUBLICKEY !== 'string' ||
  typeof process.env.AUTH_PRIVATEKEY !== 'string') {
  throw new TypeError('specify AUTH_PUBLICKEY, AUTH_PRIVATEKEY, RESPONSIBLE, ORIGIN envvar');
}

const ORIGIN = process.env.ORIGIN,
  RESPONSIBLE = process.env.RESPONSIBLE,
  AUTH_PUBLICKEY = process.env.AUTH_PUBLICKEY,
  AUTH_PRIVATEKEY = process.env.AUTH_PRIVATEKEY;

export default async (apiPath: string) => {
  const authPath = '/auth',
    [authRouter, userRouter, wss] = await Promise.all([auth(`${apiPath}${authPath}`), user(), initWs()]),
    router = new Router()
      .use((context, next) => {
        context.apiPath = apiPath;
        context.authPath = `${apiPath}${authPath}`;
        context.wss = wss;
        context.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        context.set('Pragma', 'no-cache');
        context.set('Expires', '0');
        return next();
      })
      .use(authPath, authRouter.routes())
      .get('/ws', wss.getMiddleware())
      .use(userRouter.routes())
      .get('/csrf', (context: Context) => {
        context.body = jsonwebtoken.sign({}, `-----BEGIN PRIVATE KEY-----\n${AUTH_PRIVATEKEY}\n-----END PRIVATE KEY-----`, { issuer: ORIGIN, expiresIn: '1h', algorithm: 'RS256' });
      })
      .get('/responsible', (context: Context) => {
        const authParts = context.header.authorization?.trim().split(' ');
        if (authParts?.length === 2) {
          const [scheme, token] = authParts;
          if (scheme.toLowerCase() === 'bearer' && jsonwebtoken.verify(token, `-----BEGIN PUBLIC KEY-----\n${AUTH_PUBLICKEY}\n-----END PUBLIC KEY-----`, { issuer: ORIGIN, algorithms: ['RS256'] })) {
            context.body = RESPONSIBLE;
            return;
          }
        }
        context.throw(401);
      })
      .get('/docs.json', initAuthContext(false, false), (context: AuthContext) => {
        context.body = documentation;
      })
      .all('(.*)', async (context: Context) => context.throw(404))
      .prefix(apiPath);
  return compose([router.routes(), router.allowedMethods({ throw: true })]);
};
