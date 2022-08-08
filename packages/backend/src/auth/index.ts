/* eslint max-lines: off */
import Router from '@koa/router';
import axios from 'axios';
import grant, { GrantInstance, GrantResponse, KoaMiddleware } from 'grant';
import HttpsProxyAgent from 'https-proxy-agent';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { Context, Next, ParameterizedContext } from 'koa';
import compose from 'koa-compose';
import jwt from 'koa-jwt';
import mongoose, { Document } from 'mongoose';
import { User } from '../db';
import SessionModel from '../db/models/Session';
import logger from '../logger';
import { Role, User as UserModel } from '../models/User';
import getOauthConfig from './oauthConfig';

// for further explanation, see https://auth0.com/blog/navigating-rs256-and-jwks/
interface DecodedToken {
  provider: string;
  iat: number;
  exp: number;
  sub: string;
  iss: string;
  scope?: string;
}
interface AuthState {
  user: Document<unknown, unknown, UserModel> & UserModel;
  token: string;
  decodedToken: DecodedToken;
}

type AuthContext = ParameterizedContext<AuthState>;

interface IdInfo {
  accessToken: string;
  refreshToken?: string;
  sub: string;
  iss: string;
  preferredUsername?: string;
  email: string;
  scope?: string;
  expiresIn: number
}

if (
  typeof process.env.AUTH_CLIENT_ID !== 'string' ||
  typeof process.env.AUTH_SECRET !== 'string' ||
  typeof process.env.ORIGIN !== 'string' ||
  typeof process.env.AUTH_PUBLICKEY !== 'string' ||
  typeof process.env.AUTH_PRIVATEKEY !== 'string'
) {
  throw new TypeError('specify AUTH_CLIENT_ID, AUTH_SECRET, ORIGIN envvar');
}

const ORIGIN = process.env.ORIGIN,
  BASE_URL = ORIGIN.slice(new URL(ORIGIN).origin.length),
  AUTH_CLIENT_ID: string = process.env.AUTH_CLIENT_ID,
  AUTH_SECRET: string = process.env.AUTH_SECRET,
  AUTH_PUBLICKEY: string = process.env.AUTH_PUBLICKEY,
  AUTH_PRIVATEKEY: string = process.env.AUTH_PRIVATEKEY,
  HTTPS_PROXY: string | undefined = process.env.HTTPS_PROXY,
  NAME = process.env.NAME || 'itiergarten',
  AUTH_COOKIENAME = `${NAME}-auth`,
  JWT_COOKIENAME = `${NAME}-jwt`,
  algorithm = 'RS256',
  secrets: Record<string, string | ((header: jwksRsa.TokenHeader) => Promise<string>)> = {
    [ORIGIN]: `-----BEGIN PUBLIC KEY-----\n${AUTH_PUBLICKEY}\n-----END PUBLIC KEY-----`
    /*, 'https://accounts.google.com': jwksRsa.koaJwtSecret({
      requestAgent: HTTPS_PROXY ? HttpsProxyAgent(HTTPS_PROXY) : undefined,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 1,
      jwksUri: 'https://www.googleapis.com/oauth2/v2/certs'
    }) */
  },
  jwtMiddleware = jwt({
    // can be an array or async fn (or ctx.state.secret):
    secret: (header, { iss }: { iss: string}) => {
      const returnOrCall = (secret: string | ((tokenHeader: jwksRsa.TokenHeader) => Promise<string>)) => (typeof secret === 'string') ? secret : secret(header);
      if (Object.prototype.hasOwnProperty.call(secrets, 'iss')) {
        // be specific
        return returnOrCall(secrets[iss]);
      }
      return Promise.all(Object.values(secrets).map((secret) => returnOrCall(secret))); // check all secret provider
    },
    key: 'decodedToken',
    tokenKey: 'token', // ctx.state.token
    // audience,
    issuer: [ORIGIN],
    algorithms: [algorithm],
    ignoreExpiration: true,
    passthrough: true,
    getToken: (context) => context.cookies.get(JWT_COOKIENAME) ?? null
  } as jwt.Options);

function hasRoles(context: Context, roles: Array<Role> | Role): boolean {
  if (Array.isArray(roles)) {
    return roles.some((role) => hasRoles(context, role));
  }
  return context.state.user?.roles?.includes(roles as Role) ??
    context.state.decodedToken?.scope?.split(' ').includes(roles) ??
    false;
}

function requiresRoles(roles: Array<Role> | Role) {
  return (context: Context, next: Next) => {
    context.assert(context.state.user != null, 401);
    if (roles) {
      context.assert(hasRoles(context, roles), 403);
    }
    return next();
  };
}

function isExpired(payload: JwtPayload) {
  if (typeof payload.exp !== 'number') {
    logger.warn('invalid exp value');
    return true;
  } else if (Math.floor(Date.now() / 1000) >= payload.exp) {
    logger.warn(`jwt expired: ${new Date(payload.exp * 1000)}`);
    return true;
  }
  return false;
}

function parseOAuthResponse(response: GrantResponse): IdInfo  {
  const error = response.error;
  if (error) {
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'string') {
      throw new TypeError(error);
    }
    throw new Error('oauth error');
  }
  const accessToken = response.access_token,
    refreshToken = response.refresh_token,
    idToken = response.id_token;
  if (!(accessToken && idToken)) {
    throw new Error('missing token in oauth response');
  }
  const idInfo = jsonwebtoken.decode(idToken);
  if (idInfo == null || typeof idInfo !== 'object') {
    throw new Error("can't decode id_token");
  }
  const preferredUsername = idInfo.name ?? idInfo.preferred_username;
  if (idInfo.sub == null || idInfo.iss == null || idInfo.email == null || idInfo.exp == null || idInfo.iat == null) {
    throw new Error('missing information in id_token');
  }
  return {
    accessToken,
    refreshToken,
    sub: idInfo.sub,
    iss: idInfo.iss,
    preferredUsername,
    email: idInfo.email,
    scope: idInfo.scope,
    expiresIn: idInfo.exp - idInfo.iat
  };
}

async function updateTokens(context: AuthContext, response: GrantResponse, provider: string) {
  const authInfo = parseOAuthResponse(response),
    now = Date.now(),
    // google doesn't always return a refresh token
    refreshToken = authInfo.refreshToken ?? context.state.user?.provider.get(provider)?.refreshToken;
  context.assert(refreshToken != null, 401, `no refresh token found for provider ${provider}`);
  // successful authentication
  logger.debug('successfull authentication');
  context.state.user = await User.findOneAndUpdate(
    {
      $or: [{
        [`provider.${provider}.sub`]: authInfo.sub
      }, {
        email: authInfo.email
      }]
    },
    {
      [`provider.${provider}`]: {
        sub: authInfo.sub,
        refreshToken
      },
      name: authInfo.preferredUsername,
      email: authInfo.email
    },
    { upsert: true, returnOriginal: false }
  );
  context.state.decodedToken = {
    provider,
    sub: context.state.user._id as string,
    iss: ORIGIN,
    scope: context.state.user.roles?.join(' '),
    iat: now,
    exp: (now + authInfo.expiresIn  * 1000) / 1000
  };
  const newToken = jsonwebtoken.sign(context.state.decodedToken, `-----BEGIN PRIVATE KEY-----\n${AUTH_PRIVATEKEY}\n-----END PRIVATE KEY-----`, { algorithm });
  // refresh ws
  if (context.state.token) {
    await context.wss.refreshToken(context.state.token, newToken);
  }
  context.state.token = newToken;
  context.cookies.set(JWT_COOKIENAME, context.state.token, {
    secure: process.env.NODE_ENV === 'production',
    path: `${BASE_URL}${context.apiPath}`,
    maxAge: authInfo.expiresIn * 1000
  });
}

async function readAuthSession(context: Context, next: Next) {
  const externalKey = context.cookies.get(AUTH_COOKIENAME);
  if (externalKey != null) {
    const data = await SessionModel.findById(externalKey).exec();
    context.session = data?.sess;
  }
  context.session = context.session || {};
  return next();
}

async function writeAuthSession(context: Context) {
  const id = context.session?.id ?? new mongoose.Types.ObjectId();
  logger.debug('writeAuthSession(): retrieving session');
  await SessionModel.findByIdAndUpdate(id, { sess: context.session, updatedAt: new Date() }, { upsert: true });
  logger.debug(`writeAuthSession(): found or created session ${id}`);
  if (!context.session?.id) {
    logger.debug(`updating cookie on path ${BASE_URL}${context.authPath}`);
    context.cookies.set(AUTH_COOKIENAME, id.toString(), {
      secure: process.env.NODE_ENV === 'production',
      path: `${BASE_URL}${context.authPath}`,
      maxAge: 2 * 60 * 1000 // 2min
    });
  }
  context.session = {
    ...context.session,
    id
  };
}

async function deleteAuthSession(context: Context) {
  if (context.session?.id) {
    await SessionModel.findByIdAndDelete(context.session.id);
  }
  context.cookies.set(AUTH_COOKIENAME, '', {
    secure: process.env.NODE_ENV === 'production',
    path: `${BASE_URL}${context.authPath}`,
    expires: new Date(0),
    maxAge: 0
  });
}

async function logout(context: Context) {
  // terminate auth session, if any
  await deleteAuthSession(context);

  // actually logout
  if (context.state.token) {
    await context.wss.logout(context.state.token);
  }
  const decodedToken = context.state.decodedToken;
  context.state.decodedToken = undefined;
  context.state.token = undefined;
  context.cookies.set(JWT_COOKIENAME, '', {
    secure: process.env.NODE_ENV === 'production',
    path: `${BASE_URL}${context.apiPath}`,
    maxAge: 0
  });
  context.state.user = await User.findByIdAndUpdate(decodedToken.sub,
    {
      $unset: { [`provider.${decodedToken.provider}.refreshToken`]: '' }
    },
    { returnOriginal: false }
  );
}

async function refresh(context: AuthContext) {
  const provider = context.state.decodedToken.provider,
    parameters = new URLSearchParams(),
    refreshToken = context.state.user.provider.get(provider)?.refreshToken;
  context.assert(refreshToken != null, 401, `no refresh token found for provider ${provider}`);
  parameters.append('grant_type', 'refresh_token');
  parameters.append('refresh_token', refreshToken);
  parameters.append('client_id', AUTH_CLIENT_ID);
  parameters.append('client_secret', AUTH_SECRET);

  let refreshUrl;
  if (context.state.decodedToken.provider === 'google') {
    refreshUrl = 'https://accounts.google.com/o/oauth2/token';
  } else {
    throw new Error('unknown provider for refreshing token');
  }
  try {
    const { data } = await axios.post(refreshUrl, parameters);
    await updateTokens(context, data, context.state.decodedToken.provider);
  } catch {
    await logout(context);
  }
  return context.state.token;
}

function initAuthContext(fetchUser = true, refreshToken?: boolean, checkExpiry = true) {
  return compose([jwtMiddleware, async (context: Context, next: Next) => {
    const state = context.state as AuthState;
    context.assert(state.decodedToken != null, 401, context.state.jwtOriginalError);
    logger.debug('token validated');
    const shouldRefresh = refreshToken === true || (refreshToken === undefined && isExpired(state.decodedToken));
    if (fetchUser || shouldRefresh) {
      const user = await User.findById(state.decodedToken.sub);
      context.assert(user != null, 403);
      state.user = user;
      if (shouldRefresh) {
        logger.warn('token expired, refreshing');
        await refresh(context as AuthContext);
      }
    }
    context.assert(!checkExpiry || !isExpired(state.decodedToken), 403);
    return next();
  }]);
}

export default function initAuth(authPath: string) {
  const oauthMiddleware = grant({
    handler: 'koa',
    request: {
      agent: HTTPS_PROXY ? HttpsProxyAgent(HTTPS_PROXY) : undefined
    },
    config: getOauthConfig(authPath)
  }) as KoaMiddleware & GrantInstance,
    router = new Router()
    // force refresh token
      .get('/refresh', initAuthContext(true, false), async (context: Context) => {
        await refresh(context);
        if (context.accepts('html')) {
          context.redirect(`${ORIGIN}/`);
        } else {
          context.redirect(`${ORIGIN}${context.apiPath}/user`);
        }
      })
      .get('/logout', initAuthContext(true, false, false), async (context: AuthContext) => {
        const provider = context.state.decodedToken.provider;
        if (provider === 'google') {
          const refreshToken = context.state.user.provider.get(provider)?.refreshToken,
            userId = context.state.decodedToken.sub;
          if (refreshToken) {
            try {
              await axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${refreshToken}`);
              logger.info(`revoked token from ${provider} for ${userId}}`);
            } catch (error) {
              logger.error(`couldn't revoke token from ${provider} ${error} for user ${userId}`);
            }
          }
        }
        await logout(context);
        context.redirect(`${ORIGIN}/`);
      })
      .use(readAuthSession)
      .all('/:provider/:override?', async function(context: Context, next: Next) {
        logger.debug(`calling grant with originalURL ${context.originalUrl}`);
        await next();
        logger.debug('grant session', context.session?.grant);
        if (context.params.override === 'callback') {
          logger.debug('deleting auth session');
          await deleteAuthSession(context);
          logger.debug('deleted auth session');
          if (context.accepts('html')) {
            logger.debug(`redirecting html to ${ORIGIN}/`);
            context.redirect(`${ORIGIN}/`);
          } else {
            logger.debug(`redirecting json to ${ORIGIN}${context.apiPath}/user`);
            context.redirect(`${ORIGIN}${context.apiPath}/user`);
          }
        } else {
          await writeAuthSession(context);
        }
      })
      .use(
        oauthMiddleware,
        async (context: Context) => {
          context.assert(context.session?.grant?.response instanceof Object, 400, 'authentication error');
          const provider = context.session.grant.provider;
          try {
            await updateTokens(context, context.session.grant.response, provider);
            logger.debug('updated tokens');
          } catch (error) {
            context.throw(403, 'authentication error', { details: error });
          }
        }
      );
  return router;
}

export { AuthContext, initAuthContext, isExpired, refresh, hasRoles, logout, requiresRoles };
