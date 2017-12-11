import BrowserFS from './browserfs'
import EventEmitter from 'eventemitter2'
import {module} from '@hot'

// (Failing) Attempt to prevent "RangeError: Maximum call stack size exceeded"
export const __unload = () => {
  // Detach all event listeners
  fs.Events.removeAllListeners()
  // fs.umount('/');
}

export const fsReady = new Promise(function (resolve, reject) {
  BrowserFS.configure({
    fs: 'MountableFileSystem',
    options: {
      '/': {
        fs: 'IndexedDB',
        options: {}
      }
    }
  }, (err) => err ? reject(err) : resolve())
})
// Step 2. Export fs
let fs = BrowserFS.BFSRequire('fs')
// Wrap fs so we can monitor all file operations
fs.Events = new EventEmitter()

function emit(propKey, ...args) {
  switch (propKey) {
    case 'writeFile':
    case 'writeFileSync':
      return fs.Events.emit('write', {
        eventType: 'write',
        filepath: args[0]
      });
    case 'mkdir':
    case 'mkdirSync':
      return fs.Events.emit('mkdir', {
        eventType: 'mkdir',
        filepath: args[0]
      });
    case 'unlink':
    case 'unlinkSync':
      fs.Events.emit('unlink', {
        eventType: 'unlink',
        filepath: args[0]
      });
      return
    case 'rmdir':
    case 'rmdirSync':
      return fs.Events.emit('rmdir', {
        eventType: 'rmdir',
        filepath: args[0]
      });
    case 'rename':
    case 'renameSync':
      return fs.Events.emit('rename', {
        eventType: 'rename',
        from: args[0],
        to: args[1]
      });
    default:
      return
  }
}

function traceMethodCalls(obj) {
  const handler = {
    get(target, propKey, receiver) {
      const targetValue = Reflect.get(target, propKey, receiver);
      if (typeof targetValue === 'function') {
        return function (...args) {
          for (let i in args) {
            if (typeof args[i] === 'function') {
              let _callback = args[i];
              args[i] = function (...cbargs) {
                _callback(...cbargs);
                if (!cbargs[0]) {
                  console.log('CALLBACK', propKey, args, cbargs);
                  emit(propKey, ...args);
                }
              }
            }
          }
          let result = targetValue.apply(this, args); // (A)
          if (propKey.endsWith('Sync')) {
            console.log('CALLED', propKey, args, result);
            fs.Events.emit('change', {
              eventType: 'change',
              filename: file
            })
          }
          return result;
        }
      } else {
        return targetValue;
      }
    }
  };
  return new Proxy(obj, handler);    
}

fs = traceMethodCalls(fs)

window.fs = fs
export default fs
