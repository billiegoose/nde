global = self
importScripts('https://unpkg.com/browserfs@1.3.0')
importScripts('https://wzrd.in/standalone/mime')
console.log('BrowserFS =', BrowserFS)

const Files = new Promise(function(resolve, reject) {
  new BrowserFS.FileSystem.IndexedDB((err, idbfs) => {
    if (err) return reject(err)
    BrowserFS.initialize(idbfs)
    let fs = BrowserFS.BFSRequire('fs')
    resolve(fs)
  })
})

function pathFromURL (url) {
  return url.replace(/^(https?:)?\/\/[^\/]+/, '')
}

self.addEventListener('fetch', (event) => {
  let request = event.request
  // If it's not a GET request, we can't help you.
  if (request.method !== 'GET') return
  // For now, ignore other domains. We might very well want to cache them later though.
  if (!request.url.startsWith(self.location.origin)) return
  // Turn URL into a file path
  let path = pathFromURL(request.url)
  // Sanity check
  if (path === '/') path = '/index.html' // TODO: Do I have to do all the path normalization logic normally handled by the server?
  // Otherwise, try fetching from the "file system".
  event.respondWith(tryFsFirst(path))
})

async function tryFsFirst (path) {
  return new Promise(function(resolve, reject) {
    Files.then(fs => {
      fs.exists(path, (found) => {
        if (found) {
          console.log('Holy crap we found ' + path + ' in the file system')
          fs.readFile(path, 'utf8', (err, data) => {
            if (err) return reject(err)
            return resolve(new Response(data, {
              headers: {
                'Content-Type': mime.lookup(path)
              }
            }))
          })
        } else {
          console.log(path + ' ain\'t there')
          return resolve(fetch(path))
        }
      })
    })
  })
}