import { RouterParamContext } from '@koa/router';
import { matchers } from 'jest-json-schema';
import Koa, { Context, DefaultContext, DefaultState } from 'koa';
import { Connection } from 'mongoose';
import request from 'supertest';
import { initApp } from '../src';
import { initMongo } from '../src/db';

let app: Koa<DefaultState, DefaultContext & Context & RouterParamContext<DefaultState, DefaultContext>>, database: Connection;

expect.extend(matchers);

beforeAll(async () => {
  [database, app] = await Promise.all([
    initMongo(global.__MONGO_URI__),
    initApp()
  ]);
  jest.setTimeout(30_000);
});

afterAll(async () => {
  await database.close();
});

describe('General API', function() {
  it('unknown url responds with 404', async function() {
    const response = await request(app.callback())
      .get('/api/someunknown')
      .accept('application/json')
      .expect('Content-Type', /json/)
      .expect(404);
    expect(response.body).toHaveProperty('status', 404);
    expect(response.body).toMatchSchema({
      type: 'object',
      properties: {
        status: {
          type: 'number'
        },
        message: {
          type: 'string'
        }
      }
    });
  });

  it.skip('json payloads of 10kb are generally accepted', async function() {
    const response = await request(app.callback())
      .post('/api/user/someunknown')
      .accept('application/json')
      .send([Array.from({ length: 10 * 1024 - 4 }).fill('x').join('')])
      .expect(404);
    expect(response.body).toHaveProperty('status', 404);
    expect(response.body).toMatchSchema({
      type: 'object',
      properties: {
        status: {
          type: 'number'
        },
        message: {
          type: 'string'
        }
      }
    });
  });

  it.skip('json payloads bigger than 10kb are not accepted', async function() {
    const response = await request(app.callback())
      .post('/api/user/someunknown')
      .accept('application/json')
      .send([Array.from({ length: 10 * 1024 - 4 + 1 }).fill('x').join('')])
      .expect(413);
    expect(response.body).toHaveProperty('status', 413);
    expect(response.body).toMatchSchema({
      type: 'object',
      properties: {
        status: {
          type: 'number'
        },
        message: {
          type: 'string'
        }
      }
    });
  });

  it('has security header set', async function() {
    const response = await request(app.callback()).get('/').expect(200);

    // Content Security Policy
    expect(response.get('Content-Security-Policy')).toBe(
      `default-src 'self';base-uri 'self';connect-src 'self';form-action 'self';frame-src 'none';frame-ancestors 'none';script-src 'self' 'sha256-G3b4OOW/9PWDPKCEfEvjuiYzcm0TPRC7GmhWp4U548M=';img-src 'self';script-src-attr 'none';style-src 'self' 'sha256-GqeUjWVt2JyfHy42oTCcbm2MvVMewi3SI4bayfIqK/I=';object-src 'none'${process.env.NODE_ENV !== 'development' ? ';upgrade-insecure-requests' : ''}`
    );
    // dns prefetch
    expect(response.get('X-DNS-Prefetch-Control')).toBe('off');
    // frameguard
    expect(response.get('X-Frame-Options')).toBe('SAMEORIGIN');
    // no x-powered-by
    expect(response.get('x-powered-by')).not.toBeDefined();
    // HSTS
    if (
      process.env.HTTPS_KEY &&
      process.env.HTTPS_CERT &&
      (!process.env.HTTPS_HSTS || process.env.HTTPS_HSTS.toLowerCase() !== 'false')
    ) {
      expect(response.get('Strict-Transport-Security')).toBe('max-age=15552000; includeSubDomains');
    } else {
      expect(response.get('Strict-Transport-Security')).toBe('max-age=15552000; includeSubDomains');
    }
    // ieNoOpen
    expect(response.get('X-Download-Options')).toBe('noopen');
    // nosniff mimetype
    expect(response.get('X-Content-Type-Options')).toBe('nosniff');
    // don't embed
    expect(response.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
    // XSS
    expect(response.get('X-XSS-Protection')).toBe('0');
    // etags
    expect(response.get('etag')).toBeDefined();
  });
});
