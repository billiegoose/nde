// Step 1. Setup BrowserFS
import BrowserFS from './browserfs'
import index from '/index.json'

export const fsReady = new Promise(function(resolve, reject) {
  BrowserFS.configure({
    fs: "MountableFileSystem",
    options: {
      "/": {
        fs: "OverlayFS",
        options: {
          writable: {
            fs: "IndexedDB",
            options: {}
          },
          readable: {
            fs: "XmlHttpRequest",
            options: {
              index: index
            }
          }
        }
      }
    }
  }, (err) => err ? reject(err) : resolve())
})
// Step 2. Export fs
const fs = BrowserFS.BFSRequire('fs')
// Cheap hack to get file monitoring in
import EventEmitter from 'eventemitter2'
fs.Events = new EventEmitter()
fs._origWriteFile = fs.writeFile
fs.writeFile = function (file, data, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  console.log('writeFile', file)
  fs._origWriteFile(file, data, options, (err) => {
    if (!err) {
      fs.Events.emit('change', {
        eventType: 'change',
        filename: file
      })
    }
    if (callback) callback(err)
  })
}
fs._origWriteFileSync = fs.writeFileSync
fs.writeFileSync = function (file, ...args) {
  console.log('writeFileSync', file)
  results = fs._origWriteFileSync(file, ...args)
  setTimeout( () => {
    fs.Events.emit('change', {
      eventType: 'change',
      filename: file
    })
  }, 0)
  return results
}
fs._origMkdir = fs.mkdir
fs._origMkdirSync = fs.mkdirSync
fs.mkdir = function (path, mode, callback) {
  console.log('mkdir', path)
  if (typeof mode === 'function') {
    callback = mode
    mode = 0o777
  }
  fs._origMkdir(path, mode, (err) => {
    if (!err) {
      fs.Events.emit('change', {
        eventType: 'change',
        filename: path
      })
    }
    if (callback) return callback(err)
  })
}
fs.mkdirSync = function (path, ...args) {
  console.log('mkdirSync', path)
  let results = fs._origMkdirSync(file, ...args)
  setTimeout( () => {
    fs.Events.emit('change', {
      eventType: 'change',
      filename: path
    })
  }, 0)
  return results
}


window.fs = fs
export default fs

// (Failing) Attempt to prevent "RangeError: Maximum call stack size exceeded"
import {module} from '@hot'
export const __unload = () => {
  // Detach all event listeners
  fs.Events.removeAllListeners()
  // fs.umount('/');
}