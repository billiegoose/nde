// OK, so workerpool and comlink both seem to fall short of magically achieving our goals,
// so lets try doing a boring manual proxy.

// shimming
global = self
window = global
// Note: using browserfs@2.0.0 in a WebWorker with IndexedDB does not work for some reason, so we're using 1.4.3
importScripts('https://unpkg.com/browserfs@1.4.3/dist/browserfs.js')
// importScripts('https://unpkg.com/workerpool@2.3.0/dist/workerpool.min.js')
importScripts('https://unpkg.com/isomorphic-git@0.11.2/dist/bundle.umd.min.js')
importScripts('https://unpkg.com/eventemitter3@3.1.0/umd/eventemitter3.min.js')
console.log(BrowserFS, git)

function print () {
  console.log(BrowserFS, git)
}

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
fsEvents = new global.EventEmitter3
fs._origWriteFile = fs.writeFile
fs.writeFile = function (file, data, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  console.log('writeFile', file)
  fs._origWriteFile(file, data, options, (err) => {
    if (!err) {
      global.postMessage({
        SOURCE: 'isomorphic-git-worker:fs',
        EVENT: {
          eventType: 'change',
          filename: file
        }
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
    global.postMessage({
      SOURCE: 'isomorphic-git-worker:fs',
      EVENT: {
        eventType: 'change',
        filename: file
      }
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
      global.postMessage({
        SOURCE: 'isomorphic-git-worker:fs',
        EVENT: {
          eventType: 'change',
          filename: path
        }
      })
    }
    if (callback) return callback(err)
  })
}
fs.mkdirSync = function (path, ...args) {
  console.log('mkdirSync', path)
  let results = fs._origMkdirSync(file, ...args)
  setTimeout( () => {
    global.postMessage({
      SOURCE: 'isomorphic-git-worker:fs',
      EVENT: {
        eventType: 'change',
        filename: path
      }
    })
  }, 0)
  return results
}
fs._origUnlink = fs.unlink
fs.unlink = function (path, callback) {
  console.log('unlink', path)
  fs._origUnlink(path, (err) => {
    if (!err) {
      global.postMessage({
        SOURCE: 'isomorphic-git-worker:fs',
        EVENT: {
          eventType: 'change',
          filename: path
        }
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
    global.postMessage({
      SOURCE: 'isomorphic-git-worker:fs',
      EVENT: {
        eventType: 'change',
        filename: path
      }
    })
  }, 0)
  return undefined
}
fs._origRmdir = fs.rmdir
fs.rmdir = function (path, callback) {
  console.log('rmdir', path)
  fs._origRmdir(path, (err) => {
    if (!err) {
      global.postMessage({
        SOURCE: 'isomorphic-git-worker:fs',
        EVENT: {
          eventType: 'change',
          filename: path
        }
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
    global.postMessage({
      SOURCE: 'isomorphic-git-worker:fs',
      EVENT: {
        eventType: 'change',
        filename: path
      }
    })
  }, 0)
  return undefined
}

function openEventChannel () {
  const channel = new MessageChannel();
  fsEvents.on('change', (value) => {
    channel.port1.postMessage(value)
  })
  console.log(channel)
  return channel.port2
}

global.onmessage = async ({ data }) => {
  console.log(data)
  switch (data.CALL) {
    case 'init':
      try {
        let result = await git.init({ fs, ...data.ARGS })
        if (result === undefined) {
          global.postMessage({
            TO: data.REPLYTO,
            RESOLVE_VOID: true
          })
        } else {
          global.postMessage({
            TO: data.REPLYTO,
            RESOLVE: result
          })          
        }
      } catch (err) {
        global.postMessage({
          TO: data.REPLYTO,
          REJECT: err.message
        })
      }
    default:
      console.log(data)
  }
}

fsReady.then(() => {
  // workerpool.worker({
  //   print,
  //   openEventChannel,
  //   ...fs,
  //   init: (args) => git.init({fs, ...args}),
  //   clone: (args) => git.clone({fs, ...args}),
  //   listBranches: (args) => git.listBranches({fs, ...args}),
  //   listTags: (args) => git.listTags({fs, ...args}),
  //   listFiles: (args) => git.listFiles({fs, ...args}),
  // })
})