global = self
importScripts('nde/nde/builtins/browserfs.js')
importScripts('nde/nde/deps/mime/bundle.js')
importScripts('https://unpkg.com/omnipath@1.1.5/dist/omnipath.min.js')
importScripts('nde/nde/packages/render-index/index.js')
// Note: this won't exist until you run 'npm run build'
importScripts('indexjson.js')

console.log('OmniPath =', OmniPath)
console.log('renderIndex =', renderIndex)
console.log('BrowserFS =', BrowserFS)

const Files = new Promise(function(resolve, reject) {
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
              index: XmlHttpRequestIndexJSON
            }
          }
        }
      }
    }
  }, (err) => err ? reject(err) : resolve(BrowserFS.BFSRequire('fs')))
})

function pathFromURL (url) {
  return url.replace(/^(https?:)?\/\/[^\/]+/, '')
}

self.addEventListener('fetch', (event) => {
  let request = event.request
  // We need to cache GET (readFile) and HEAD (getFileSize) requests for proper offline support.
  if (request.method !== 'GET' && request.method !== 'HEAD') return
  // Is it for a package CDN?
  const requestHost = OmniPath.parse(request.url).hostname
  if (requestHost === 'unpkg.com') return event.respondWith(permaCache(request, 'unpkg'))
  if (requestHost === 'wzrd.in') return event.respondWith(permaCache(request, 'wzrd'))
  if (requestHost === 'cdnjs.cloudflare.com') return event.respondWith(permaCache(request, 'cdnjs'))
  if (requestHost === 'api.cdnjs.com') return event.respondWith(permaCache(request, 'cdnjs'))
  if (requestHost === 'rawgit.com') return event.respondWith(permaCache(request, 'rawgit'))
  // For now, ignore other domains. We might very well want to cache them later though.
  if (!request.url.startsWith(self.location.origin)) return
  // Turn URL into a file path
  let path = pathFromURL(request.url)
  // Sanity check
  if (path === '') path = '/'
  // Otherwise, try fetching from the "file system".
  event.respondWith(tryFsFirst(path))
})

async function permaCache (request, name) {
  let betterRequest = new Request(request.url, {
    mode: 'cors',
    credentials: 'omit',
    redirect: 'follow'
  })
  let cache = await caches.open(name)
  let response = await cache.match(betterRequest.url)
  console.log('request.url =', betterRequest.url)
  if (response) {
    console.log('yay!', betterRequest.url)
    return response
  }
  response = fetch(betterRequest)
  response.then(res => {
    console.log('Y U NOT CACHED?', betterRequest)
    console.log(res.status, betterRequest.url, res.url)
    // Note: It is important that we use the response URL,
    // not the request URL, unless you want to permanently
    // resolve redirects. I only want to permanently resolve
    // exact versions.
    if (res.status === 200) cache.put(request.url, res.clone())
    // Changed my mind. Let's just cache the redirected result,
    // because that gives us true offline support, version pinning
    // be damned.
    // if (res.status === 302) cache.put(betterRequest.url, res.clone())
  })
  return response
}

async function tryFsFirst (path) {
  return new Promise(function(resolve, reject) {
    Files.then(fs => {
      fs.stat(path, (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') console.log(path + ' ain\'t there')
          else console.log('A more interesting error occurred!', err)
          let response = fetch(path)
          response
          .then(res => {
            console.log('---HEYHEY')
            if (!res.ok) return
            res.clone().text().then(content => {
              console.log('---Saving results')
              fs.writeFile(path, content, 'utf8')
            })
          })
          .catch(console.log)
          return resolve(response)
        } else if (stats.isDirectory()) {
          console.log(path + ' is a Directory!')
          // If the directory doesn't end in a slash, redirect it
          // because otherwise relative URLs will have trouble.
          if (!path.endsWith('/')) return resolve(Response.redirect(path + '/', 302))
          console.log('fs =', fs)
          fs.readdir(path, (err, data) => {
            if (err) return reject(err)
            // data = JSON.stringify(data, null, 2)
            console.log('data =', data)
            // Serve directory/index.html if it exists
            if (data.includes('index.html')) {
              fs.readFile(`${path}/index.html`, 'utf8', (err, data) => {
                if (err) return reject(err)
                return resolve(new Response(data, {
                  headers: {
                    'Content-Type': 'text/html'
                  }
                }))
              })
            } else {
              // If it doesn't exist, generate a directory index
              try {
                data = renderIndex(path, data)
              } catch (e) {
                console.log('e =', e)
              }
              console.log('data =', data)
              return resolve(new Response(data, {
                headers: {
                  'Content-Type': 'text/html'
                }
              }))
            }
          })
        } else {
          fs.readFile(path, 'utf8', (err, data) => {
            if (err) return reject(err)
            return resolve(new Response(data, {
              headers: {
                'Content-Type': mime.lookup(path)
              }
            }))
          })
        }
      })
    })
  })
}