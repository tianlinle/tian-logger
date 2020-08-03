import * as fs from 'fs';
import * as AsyncHooks from 'async_hooks';

type ConstructorOptions = { level: keyof typeof Logger.levelValue, writer?: (object: Object) => any, meta?: any };

export const defaultWriter = (object) => {
  if (object instanceof Error) {
    Object.assign({ message: object.message, stack: object.stack }, object);
  }
  fs.writeSync(1, JSON.stringify(object) + "\n");
}

export class Logger {
  static levelValue = {
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    final: 100
  }
  asyncIdMap: Map<number, any>
  hook: AsyncHooks.AsyncHook
  level: number
  writer: (object: Object) => any

  constructor(options?: ConstructorOptions) {
    this.level = options.level ? Logger.levelValue[options.level] : Logger.levelValue.info;
    this.writer = options.writer || defaultWriter;
    this.asyncIdMap = new Map();
    this.hook = AsyncHooks.createHook({
      init: (asyncId, type, triggerAsyncId) => {
        fs.writeSync(1, `${triggerAsyncId} > ${asyncId}\n`);
        const ctx = this.asyncIdMap.get(triggerAsyncId);
        this.asyncIdMap.set(asyncId, ctx);
      },
      after: (asyncId) => {
        fs.writeSync(1, `X ${asyncId}\n`);
        this.asyncIdMap.delete(asyncId);
      }
    }).enable();
    this.asyncIdMap.set(AsyncHooks.executionAsyncId(), options.meta || {});
  }

  attach(meta) {
    const asyncId = AsyncHooks.executionAsyncId();
    this.asyncIdMap.set(asyncId, Object.assign({}, this.asyncIdMap.get(asyncId), meta));
  }

  setLevel(level: keyof typeof Logger.levelValue) {
    this.level = Logger.levelValue[level];
  }

  setWriter(writer: (object: Object) => any) {
    this.writer = writer;
  }

  write(level: keyof typeof Logger.levelValue, message: string | Object, data?: Object) {
    if (Logger.levelValue[level] >= this.level) {
      const object = {};
      if (message instanceof Object) {
        Object.assign(object, message);
      } else {
        Object.assign(object, { message });
      }
      Object.assign(object, { level, time: new Date().toISOString() }, this.asyncIdMap.get(AsyncHooks.executionAsyncId()), data);
      return this.writer(object);
    }
  }

  debug(message: string | Object, data?: Object) {
    return this.write('debug', message, data);
  }

  info(message: string | Object, data?: Object) {
    return this.write('info', message, data);
  }

  warn(message: string | Object, data?: Object) {
    return this.write('warn', message, data);
  }

  error(message: string | Object, data?: Object) {
    return this.write('error', message, data);
  }
}
