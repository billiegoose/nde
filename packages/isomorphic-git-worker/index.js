
// // Version 2, which also emits events.
// OK, so workerpool and comlink both seem to fall short of magically achieving our goals,
// so lets try doing a boring manual proxy.

import EventEmitter from 'eventemitter3'
let Events = new EventEmitter

let w = new Worker('./packages/isomorphic-git-worker/eventedworker.js')

function wrap (fname) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      let timestamp = performance.now()
      w.postMessage({ REPLYTO: timestamp, CALL: fname, ARGS: args })
      // Add a listener that waits for a single specific message
      // (the return value of this operation) then removes itself.
      w.addEventListener('message', function listen ({ data }) {
        if (data.TO === timestamp) {
          w.removeEventListener('message', listen)
          if (data.RESOLVE_VOID !== undefined) resolve()
          else if (data.RESOLVE !== undefined) resolve(data.RESOLVE)
          else if (data.REJECT !== undefined) reject(data.REJECT)
          else reject(new Error(`Problem encountered calling ${fname}`))
        }
      })
    })
  }
}

export const GitWorker = {
  init: wrap('init'),
  unlink: wrap('unlink'),
  mkdir: wrap('mkdir'),
  readFile: wrap('readFile'),
  writeFile: wrap('writeFile'),
  rimraf: wrap('rimraf'),
  rename: wrap('rename'),
  readdir: wrap('readdir'),
  stat: wrap('stat'),
  Events
}
window.GitWorker = GitWorker

// Filter
w.addEventListener('message', function listen ({ data }) {
  console.log(data)
  if (data.SOURCE === 'isomorphic-git-worker:fs') {
    Events.emit('change', data.EVENT)
  }
})

Events.on('change', (data) => {
  console.log('FILE CHANGED!!!', data.filename)
})
