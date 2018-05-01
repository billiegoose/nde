// OK, so workerpool and comlink both seem to fall short of magically achieving our goals,
// so lets try doing a boring manual proxy.

// shimming
global = self
window = global
// Note: using browserfs@2.0.0 in a WebWorker with IndexedDB does not work for some reason, so we're using 1.4.3
importScripts('https://unpkg.com/browserfs@1.4.3/dist/browserfs.js')
importScripts('https://unpkg.com/isomorphic-git@0.11.2/dist/bundle.umd.min.js')
console.log(BrowserFS, git)

// A small implementation of 'promisify'
const pfy = function (fn) {
  return function (...a) {
    return new Promise(function(resolve, reject) {
      fn(...a, (err, result) => err ? reject(err) : resolve(result))
    });
  }
}

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

const fs = BrowserFS.BFSRequire('fs')

// Cheap hack to get file monitoring in
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


// It's elegant in its naivety
async function rimraf (path) {
  try {
    // First assume path is itself a file
    await pfy(fs.unlink)(path)
    // if that worked we're done
    return
  } catch (err) {
    // Otherwise, path must be a directory
    if (err.code !== 'EISDIR') throw err
  }
  // Knowing path is a directory,
  // first, assume everything inside path is a file.
  let files = await pfy(fs.readdir)(path)
  for (let file of files) {
    let child = path + '/' + file
    try {
      await pfy(fs.unlink)(child)
    } catch (err) {
      if (err.code !== 'EISDIR') throw err
    }
  }
  // Assume what's left are directories and recurse.
  let dirs = await pfy(fs.readdir)(path)
  for (let dir of dirs) {
    let child = path + '/' + dir
    await rimraf(child)
  }
  // Finally, delete the empty directory
  await pfy(fs.rmdir)(path)
}


async function run(fn, args, REPLYTO) {
  try {
    let result = await fn.apply(null, args)
    if (result === undefined) {
      global.postMessage({
        TO: REPLYTO,
        RESOLVE_VOID: true
      })
    } else {
      global.postMessage({
        TO: REPLYTO,
        RESOLVE: result
      })          
    }
  } catch (err) {
    global.postMessage({
      TO: REPLYTO,
      REJECT: err.message
    })
  }
}

global.onmessage = async ({ data }) => {
  console.log(data)
  await fsReady
  switch (data.CALL) {
    case 'init':
      return run(git.init, [{ fs, ...data.ARGS[0] }], data.REPLYTO)
    case 'unlink':
      return run(pfy(fs.unlink), data.ARGS, data.REPLYTO)
    case 'mkdir':
      // Let's ignore the 'mode' parameter.  
      return run(pfy(fs.mkdir), data.ARGS, data.REPLYTO)
    case 'readFile':
      return run(pfy(fs.readFile), data.ARGS, data.REPLYTO)
    case 'writeFile':
      return run(pfy(fs.writeFile), data.ARGS, data.REPLYTO)
    case 'rimraf':
      return run(rimraf, data.ARGS, data.REPLYTO)
    case 'rename':
      return run(pfy(fs.rename), data.ARGS, data.REPLYTO)
    case 'readdir':
      return run(pfy(fs.readdir), data.ARGS, data.REPLYTO)
    case 'stat':
      return run(pfy(fs.stat), data.ARGS, data.REPLYTO)
    default:
      console.log(data)
  }
}
