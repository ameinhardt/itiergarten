/* eslint-disable unicorn/prefer-module, eslint-comments/disable-enable-pair */
const { join } = require('node:path'),
  { config } = require('dotenv');

config({
  path: join(__dirname, '..', '.env.test')
});
