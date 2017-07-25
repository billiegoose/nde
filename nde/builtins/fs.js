// Step 1. Setup BrowserFS
import BrowserFS from 'browserfs'

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
            options: {}
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
  console.log('file =', file)
  fs._origWriteFile(file, data, options, (err) => {
    if (!err) {
      this.Events.emit('change', {
        eventType: 'change',
        filename: file
      })
    }
    if (callback) callback(err)
  })
}
fs._origWriteFileSync = fs.writeFileSync
fs.writeFileSync = function (file, ...args) {
  console.log('file =', file)
  results = fs._origWriteFileSync(file, ...args)
  setTimeout( () => {
    this.Events.emit('change', {
      eventType: 'change',
      filename: file
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
  mfs.umount('/');
}