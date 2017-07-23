// Step 1. Setup BrowserFS
import BrowserFS from 'browserfs'

export const fsReady = new Promise(function(resolve, reject) {
  new BrowserFS.FileSystem.IndexedDB((err, idbfs) => {
    let ajaxFS = new BrowserFS.FileSystem.XmlHttpRequest();
    // let localStorageFS = new BrowserFS.FileSystem.LocalStorage();
    let overlayFS = new BrowserFS.FileSystem.OverlayFS(idbfs, ajaxFS);
    overlayFS.initialize(() => {
      let mfs = new BrowserFS.FileSystem.MountableFileSystem();
      mfs.mount('/', overlayFS);
      // Initialize it as the root file system.
      BrowserFS.initialize(mfs);
      resolve()
    })
  })
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