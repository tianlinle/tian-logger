import * as fs from 'fs';
import * as AsyncHooks from 'async_hooks';

export type ConstructorOptions = { level: keyof typeof Logger.levelValue, writer?: (object: LoggingObject) => any, meta?: any };
export type LoggingObject = { level: keyof typeof Logger.levelValue, time: string, message: string, meta: any, data?: any };

export const stringifyReplacer = (k, v) => {
  const seen = new WeakSet();
  if (typeof v === "object" && v !== null) {
    if (seen.has(v)) {
      return;
    }
    seen.add(v);
    if (v instanceof Error) {
      v = {
        name: v.name,
        message: v.message,
        stack: typeof v.stack === 'string' ? v.stack.split('\n    ').slice(1) : v.stack
      };
    }
  }
  return v;
}

export const defaultWriter = (object) => {
  fs.writeSync(1, JSON.stringify(object, stringifyReplacer) + "\n");
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
        const ctx = this.asyncIdMap.get(triggerAsyncId);
        this.asyncIdMap.set(asyncId, ctx);
      },
      after: (asyncId) => {
        this.asyncIdMap.delete(asyncId);
      }
    }).enable();
    this.asyncIdMap.set(AsyncHooks.executionAsyncId(), Object.assign({}, options.meta));
  }

  attach(meta) {
    const asyncId = AsyncHooks.executionAsyncId();
    this.asyncIdMap.set(asyncId, Object.assign({}, this.asyncIdMap.get(asyncId), meta));
  }

  setLevel(level: keyof typeof Logger.levelValue) {
    this.level = Logger.levelValue[level];
  }

  setWriter(writer: (object: LoggingObject) => any) {
    this.writer = writer;
  }

  write(level: keyof typeof Logger.levelValue, message: string, data?: Object) {
    if (Logger.levelValue[level] >= this.level) {
      data = data || {};
      Object.assign({}, this.asyncIdMap.get(AsyncHooks.executionAsyncId()), data);
      const object: LoggingObject = {
        level,
        time: new Date().toISOString(),
        message,
        meta: this.asyncIdMap.get(AsyncHooks.executionAsyncId()),
        data
      };
      return this.writer(object);
    }
  }

  debug(message: string, data?: Object) {
    return this.write('debug', message, data);
  }

  info(message: string, data?: Object) {
    return this.write('info', message, data);
  }

  warn(message: string, data?: Object) {
    return this.write('warn', message, data);
  }

  error(message: string, data?: Object) {
    return this.write('error', message, data);
  }
}
