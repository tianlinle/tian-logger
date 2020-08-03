import { Logger } from '../Logger';
import * as AsyncHooks from 'async_hooks';

let logger;

async function a() {
  const asyncId = AsyncHooks.executionAsyncId();
  const triggreId = AsyncHooks.triggerAsyncId();
  logger.attach({ a: 'test' });
  logger.info('before promise in a');
  await Promise.resolve();
  const asyncId2 = AsyncHooks.executionAsyncId();
  const triggerId2 = AsyncHooks.triggerAsyncId();
  logger.info('after promise in a');
}

(async () => {
  logger = new Logger({
    meta: { process: 'example' },
    level: 'debug'
  });
  const asyncId = AsyncHooks.executionAsyncId();
  const triggreId = AsyncHooks.triggerAsyncId();
  logger.info('start');
  await a();
  const asyncId2 = AsyncHooks.executionAsyncId();
  const triggerId2 = AsyncHooks.triggerAsyncId();
  logger.setLevel('debug');
  logger.info('end');
})();
