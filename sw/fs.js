// Step 1. Setup BrowserFS
importScripts('nde/nde/builtins/browserfs.js')
importScripts('https://cdnjs.cloudflare.com/ajax/libs/eventemitter3/2.0.3/index.min.js')

const fsReady = new Promise(function(resolve, reject) {
  BrowserFS.configure({
    fs: "MountableFileSystem",
    options: {
      "/": {
        fs: "IndexedDB",
        options: {}
      }
    }
  }, (err) => err ? reject(err) : resolve())
})
// Step 2. Export fs
const fs = BrowserFS.BFSRequire('fs')
// Cheap hack to get file monitoring in
fs.Events = new window.EventEmitter()
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
fs._origUnlink = fs.unlink
fs.unlink = function (path, callback) {
  console.log('unlink', path)
  fs._origUnlink(path, (err) => {
    if (!err) {
      fs.Events.emit('change', {
        eventType: 'change',
        filename: path
      })
    }
    if (callback) return callback(err)
  })
}
fs._origUnlinkSync = fs.unlinkSync
fs.unlinkSync = function (path) {
  console.log('unlink', path)
  fs._origUnlinkSync(path)
  setTimeout( () => {
    fs.Events.emit('change', {
      eventType: 'change',
      filename: path
    })
  }, 0)
  return undefined
}
fs._origRmdir = fs.rmdir
fs.rmdir = function (path, callback) {
  console.log('rmdir', path)
  fs._origRmdir(path, (err) => {
    if (!err) {
      fs.Events.emit('change', {
        eventType: 'change',
        filename: path
      })
    }
    if (callback) return callback(err)
  })
}
fs._origRmdirSync = fs.rmdirSync
fs.rmdirSync = function (path) {
  console.log('rmdir', path)
  fs._origRmdirSync(path)
  setTimeout( () => {
    fs.Events.emit('change', {
      eventType: 'change',
      filename: path
    })
  }, 0)
  return undefined
}

global.fs = fs
global.fsReady = fsReady
