# tian-logger
A simple logger using async_hooks. With it you don't neet to pass logger everywhere.

# Quick start

**1. Install**

```shell
npm i tian-logger
```

**2. Usage**

Create a logger with default writer in file `./globalLogger.js`
```javascript
const { Logger } = require('tian-logger');
const logger = new Logger({ level: 'info', meta: { meta1: '' } });
module.exports = logger;
```

Use the global logger anywhere
```javascript
const globalLogger = require('./globalLogger');
globalLogger.info('message only');
// {"level":"info","time":"2020-08-03T11:49:30.110Z","message":"message only","meta":{"meta1":""},"data":{}}
globalLogger.error('error with data', new Error('error'));
// {"level":"error","time":"2020-08-03T12:34:11.846Z","message":"error with data","meta":{"meta1":""},"data":{"name":"Error","message":"error","stack":["file positions"]}}

```

Customize writer:
```javascript
const { Logger } = require('tian-logger');
const fs = require('fs');
const logger = new Logger({
  writer: (object) => {
    // object is a object like
    // {
    //   message: "message",
    //   level: "debug|info|warn|error|fatal",
    //   time: "2020-08-03T10:42:25.415Z"
    //   meta: { meta1: '' },
    //   data: { field1: '' }
    // }
    fs.writeSync(1, JSON.stringify(object));
  }
})
```

# API
## Logger
### constructor([options])
+ *options.level*: 'debug' or 'info' or 'warn' or 'error' or 'final'. 'info' by default.
+ *options.meta*: the object you want to add to current context.
+ *options.writer*: customize writing logic

### attach(meta)
Add meta data to current context.
+ *meta*: the object you want to add to current context.

### setLevel(level)
Change logging level.
+ *level*: new logging level.

### setWriter(writer)
Customize writer.
+ *writer*: new writer.

### debug(message[, data])
Write message a debug level.
+ *message*: logging message
+ *data*: extra logging object

### info(message[, data])
Write message a info level.
+ *message*: logging message
+ *data*: extra logging object

### warn(message[, data])
Write message a warn level.
+ *message*: logging message
+ *data*: extra logging object

### error(message[, data])
Write message a error level.
+ *message*: logging message
+ *data*: extra logging object

### final(message[, data])
Write message a final level.
+ *message*: logging message
+ *data*: extra logging object
