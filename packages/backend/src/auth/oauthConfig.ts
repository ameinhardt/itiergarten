import { GrantConfig } from 'grant';

if (
  typeof process.env.AUTH_CLIENT_ID !== 'string' ||
  typeof process.env.AUTH_SECRET !== 'string' ||
  typeof process.env.ORIGIN !== 'string'
) {
  throw new TypeError('specify AUTH_CLIENT_ID, AUTH_SECRET, ORIGIN envvar');
}

const ORIGIN = process.env.ORIGIN,
  AUTH_CLIENT_ID: string = process.env.AUTH_CLIENT_ID,
  AUTH_SECRET: string = process.env.AUTH_SECRET;

export default function getOauthConfig(authPath: string): GrantConfig {
  return {
    defaults: {
      transport: 'session',
      state: true,
      prefix: authPath
    },
    /* eslint-disable camelcase */
    google: {
      key: AUTH_CLIENT_ID,
      secret: AUTH_SECRET,
      nonce: true,
      redirect_uri: `${ORIGIN}/`,
      scope: ['openid', 'email', 'profile'],
      custom_params: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
    /* eslint-enable camelcase */
  };
}
