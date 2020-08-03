import { Logger } from '../index';
import * as AsyncHooks from 'async_hooks';

const logger = new Logger({
  meta: { meta1: '' },
  level: 'debug'
});;

async function a() {
  logger.info('before promise in a');
  await Promise.resolve();
  logger.info('after promise in a');
}

(async () => {
  logger.attach({ a: 'test' });
  logger.info('start');
  await a();
  logger.setLevel('debug');
  logger.error('error with data', new Error('error'));
})();
