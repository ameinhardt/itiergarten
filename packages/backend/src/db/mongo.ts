import { connect } from 'mongoose';
import logger from '../logger';

export default async function init(MONGO_CONNECTION = process.env.MONGO_CONNECTION) {
  /* istanbul ignore if */
  if (typeof MONGO_CONNECTION !== 'string') {
    throw new TypeError('specify MONGO_CONNECTION');
  }

  logger.debug('connecting to mongodb');
  const mongoose = await connect(MONGO_CONNECTION),
    collection = mongoose.connection.collection('sessions');
  /* istanbul ignore next: db errors not covered */
  mongoose.connection.on('error', (error) => {
    logger.error(`mongodb error: ${error}`);
  });
  for (const event of ['connected', 'reconnected', 'disconnected', 'reconnectFailed', 'reconnectTries']) {
    mongoose.connection.on(event, () => logger.info(`mongodb ${event}`));
  }
  await collection.createIndex(
    { _ts: 1 },
    { expireAfterSeconds: 2 * 60, background: true }
  );
  logger.info('mongodb connected');
  return mongoose.connection;
}

export { default as User } from './models/User';
