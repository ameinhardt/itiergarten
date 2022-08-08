import jsonwebtoken, { SignOptions } from 'jsonwebtoken';
import nock from 'nock';

export function createToken(payloadOrSub: string | object, options?: SignOptions, key = process.env.AUTH_PRIVATEKEY as string) {
  return jsonwebtoken.sign(
    typeof payloadOrSub === 'string'
      ? {
          sub: payloadOrSub,
          provider: 'google'
        }
      : payloadOrSub,
    `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`,
    {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: process.env.ORIGIN,
      ...options
    }
  );
}

export function mockTokenEndpoint() {
  return nock('https://accounts.google.com')
    .post('/o/oauth2/token')
    .reply(200, {
      /* eslint-disable camelcase */
      access_token: '1/fFAGRNJru1FTz70BzhT3Zg',
      expires_in: 3599,
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
      token_type: 'Bearer'
      /* eslint-enable camelcase */
    });
}

/*
async (uri, requestBody, callback) => {
  try {
    const publicKey = await crypto.subtle.importKey('spki', Buffer.from(process.env.AUTH_PUBLICKEY as string, 'base64'), {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      }, true, ['verify']),
      jwk = await crypto.subtle.exportKey('jwk', publicKey);
    callback(null, { keys: [jwk] });
  } catch (error) {
    callback(error instanceof Error ? error : null, {});
  }
})
*/
