import { RouterParamContext } from '@koa/router';
import { matchers } from 'jest-json-schema';
import Koa, { Context, DefaultContext, DefaultState } from 'koa';
import { Connection, Document } from 'mongoose';
import nock from 'nock';
import request from 'supertest';
import { initApp } from '../src';
import { initMongo, User } from '../src/db';
import { User as UserModel } from '../src/models/User';
import { base, simpleResponse, userSchema } from '../src/routes/user/documentation';
import { BadRequestSchema, ForbiddenSchema, UnauthorizedSchema } from './schemas';
import { createToken, mockTokenEndpoint } from './utils';

expect.extend(matchers);

const mocks: Array<nock.Scope> = [];
let app: Koa<DefaultState, DefaultContext & Context & RouterParamContext<DefaultState, DefaultContext>>,
  database: Connection,
  user: Document<unknown, unknown, UserModel> & UserModel;

beforeAll(async () => {
  jest.setTimeout(45 * 1000);

  [database, app] = await Promise.all([
    initMongo(global.__MONGO_URI__),
    initApp()
  ]);

  user = new User({
    email: 'jonny@doe.com',
    id: 'jonny5',
    iss: 'https://someIdp.com',
    name: 'John Doe',
    roles: [],
    provider: new Map()
  });
  user.provider.set('google', {
    sub: '1234',
    refreshToken: '1//xEoDL4iW3cxlI7yDbSRFYNG01kVKM2C-259HOF2aQbI'
  });
  await user.save();
  // user.insertedId.toString();
  mocks.push(mockTokenEndpoint().persist());
});

afterAll(async () => {
  // await Promise.all([user.delete()]);
  await database.close();
  for (const mock of mocks)  mock.persist(false);
});

describe('User', function() {
  it('fetching user with bad jwt is not possible', async function() {
    const token = createToken(user.id, {
        expiresIn: 0,
        issuer: 'xyz'
      }),
      response = await request(app.callback())
        .get(`/api/${base}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    expect(response.body).toMatchSchema(UnauthorizedSchema);
  });

  it('fetching own user with valid jwt responds with user info', async function() {
    const token = createToken(user.id),
      response = await request(app.callback())
        .get(`/api/${base}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    expect(response.body).toMatchSchema(userSchema);
    expect(response.body.id).toBe(user.id);
  });

  it('fetching other user with valid jwt is forbidden', async function() {
    const token = createToken(user.id),
      response = await request(app.callback())
        .get(`/api/${base}/jane42`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    expect(response.body).toMatchSchema(ForbiddenSchema);
  });

  it('updating user with bad jwt is not possible', async function() {
    const token = createToken(user.id, {
        issuer: 'xyz'
      }),
      response = await request(app.callback())
        .patch(`/api/${base}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    expect(response.body).toMatchSchema(UnauthorizedSchema);
  });

  it('updating other user with valid jwt is forbidden', async function() {
    const token = createToken(user.id),
      response = await request(app.callback())
        .patch(`/api/${base}/jane42`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          givenName: 'jenny'
        })
        .expect(403);
    expect(response.body).toMatchSchema(ForbiddenSchema);
  });

  it('updating readonly property of user is not possible ', async function() {
    const token = createToken(user.id),
      response = await request(app.callback())
        .patch(`/api/${base}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          iss: 'someone'
        })
        .expect(400);
    expect(response.body).toMatchSchema(BadRequestSchema);
  });

  it('updating editable property of user is possible ', async function() {
    const token = createToken(user.id),
      givenName = 'John Doe',
      response = await request(app.callback())
        .patch(`/api/${base}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          givenName
        })
        .expect(200);
    expect(response.body).toMatchSchema(simpleResponse);
    expect(response.body.details.id).toBe(user.id);
    expect(response.body.details.givenName).toBe(givenName);
    const changedUser = await User.findById(user.id);
    expect(changedUser?.givenName).toBe(givenName);
  });

  it('deleting user with bad jwt is not possible', async function() {
    const token = createToken(user.id, {
        issuer: 'xyz'
      }),
      response = await request(app.callback())
        .delete(`/api/${base}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    expect(response.body).toMatchSchema(UnauthorizedSchema);
  });

  it('deleting other user with valid jwt is forbidden', async function() {
    const token = createToken(user.id),
      response = await request(app.callback())
        .get(`/api/${base}/jane42`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    expect(response.body).toMatchSchema(ForbiddenSchema);
  });

  it('deleting own user with valid jwt responds with former user info', async function() {
    const token = createToken(user.id),
      response = await request(app.callback())
        .delete(`/api/${base}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    expect(response.body).toMatchSchema(simpleResponse);
    expect(response.body.details.id).toBe(user.id);
    const killedUser = await User.findById(user.id);
    expect(killedUser).toBeNull();
  });
});
