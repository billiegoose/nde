// // Version 1, using workerpool but no events
// import workerpool from 'workerpool'
//
// const pool = workerpool.pool('./packages/isomorphic-git-worker/worker.js')
//
// pool.exec('print', [])
//
// export const GitWorker = pool.proxy()

// // Version 2, which also emits events.
// OK, so workerpool and comlink both seem to fall short of magically achieving our goals,
// so lets try doing a boring manual proxy.

import EventEmitter from 'eventemitter3'
let Events = new EventEmitter

let w = new Worker('./packages/isomorphic-git-worker/eventedworker.js')
export const GitWorker = Promise.resolve({
  init (args) {
    return new Promise((resolve, reject) => {
      let timestamp = performance.now()
      w.postMessage({REPLYTO: timestamp, CALL: 'init', ARGS: args})
      w.addEventListener('message', function listen ({ data }) {
        if (data.TO === timestamp) {
          w.removeEventListener('message', listen)
          if (data.RESOLVE_VOID) resolve()
          else if (data.RESOLVE) resolve(data.RESOLVE)
          else if (data.REJECT) reject(data.REJECT)
          else reject(new Error('Problem encountered calling init'))
        }
      })
    })
  }
})

w.addEventListener('message', function listen ({ data }) {
  console.log(data)
  if (data.SOURCE === 'isomorphic-git-worker:fs') {
    Events.emit('change', data.EVENT)
  }
})

Events.on('change', (data) => {
  console.log('FILE CHANGED!!!', data.filename)
})
