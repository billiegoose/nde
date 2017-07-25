global = self
importScripts('https://unpkg.com/browserfs@1.4.2')
importScripts('https://wzrd.in/standalone/mime')
importScripts('https://wzrd.in/standalone/omnipath')

console.log('omnipath =', omnipath)
console.log('renderIndex =', renderIndex)
console.log('BrowserFS =', BrowserFS)

const Files = new Promise(function(resolve, reject) {
  BrowserFS.FileSystem.IndexedDB.Create({}, (err, idbfs) => {
    if (err) return reject(err)
    BrowserFS.initialize(idbfs)
    let fs = BrowserFS.BFSRequire('fs')
    resolve(fs)
  })
})

toPaths = (dirname) => {
  let pieces = dirname.split('/').filter(x => x !== '')
  let paths = []
  let fullpath = ''
  for (let piece of pieces) {
    fullpath += '/' + piece
    paths.push({
      name: piece,
      url: fullpath.replace(/^\//, '')
    })
  }
  return paths
}

toFiles = (dirname, files) => files.map(filename => ({
  ext: omnipath.ext(filename).replace(/^\./, ''),
  base: omnipath.base(filename),
  relative: omnipath.join(dirname, filename),
  title: omnipath.base(filename),
  size: '? mb'
}))

function renderIndex (dirname, dirlist) {
  let directory = dirname.replace(/^\//, '')
  let paths = toPaths(directory)
  let files = toFiles(directory, dirlist)
  return (
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <title>Files within ${directory}</title>
  
  <style>
  body {
    background: #fff;
    margin: 0;
    padding: 30px;
    -webkit-font-smoothing: antialiased;
    font-family: Menlo, Consolas, monospace;
  }
  
  main {
    max-width: 920px;
  }
  
  a {
    color: #1A00F2;
    text-decoration: none;
  }
  
  h1 {
    font-size: 18px;
    font-weight: 500;
    margin-top: 0;
    color: #000;
    font-family: -apple-system, Helvetica;
    display: flex;
  }
  
  h1 a {
    color: inherit;
    font-weight: bold;
    border-bottom: 1px dashed transparent;
  }
  
  h1 a::after {
    content: '/';
  }
  
  h1 a:hover {
    color: #7d7d7d;
  }
  
  h1 i {
    font-style: normal;
  }
  
  ul {
    margin: 0;
    padding: 20px 0 0 0;
  }
  
  ul li {
    list-style: none;
    padding: 10px 0;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
  }
  
  ul li i {
    color: #9B9B9B;
    font-size: 11px;
    display: block;
    font-style: normal;
    white-space: nowrap;
    padding-left: 15px;
  }
  
  ul a {
    color: #1A00F2;
    white-space: nowrap;
    overflow: hidden;
    display: block;
    text-overflow: ellipsis;
  }
  
  /* file-icon – svg inlined here, but it should also be possible to separate out. */
  ul a::before {
    content: url("data:image/svg+xml; utf8, <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 64 64'><g><path fill='transparent' stroke='currentColor' stroke-width='4px' stroke-miterlimit='10' d='M50.46,56H13.54V8H35.85a4.38,4.38,0,0,1,3.1,1.28L49.18,19.52a4.38,4.38,0,0,1,1.28,3.1Z'/><polyline fill='transparent' stroke='currentColor' stroke-width='2px' stroke-miterlimit='10' points='35.29 8.31 35.29 23.03 49.35 23.03'/></g></svg>");
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
  
  ul a:hover {
    color: #000;
  }
  
  ul a[class=''] + i {
    display: none;
  }
  
  /* folder-icon */
  ul a[class='']::before {
    content: url("data:image/svg+xml; utf8, <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 64 64'><path fill='transparent' stroke='currentColor' stroke-width='4px' stroke-miterlimit='10' d='M56,53.71H8.17L8,21.06a2.13,2.13,0,0,1,2.13-2.13h2.33l2.13-4.28A4.78,4.78,0,0,1,18.87,12h9.65a4.78,4.78,0,0,1,4.28,2.65l2.13,4.28H52.29a3.55,3.55,0,0,1,3.55,3.55Z'/></svg>");
  }
  
  @media (min-width: 768px) {
    ul {
      display: flex;
      flex-wrap: wrap;
    }
    
    ul li {
      width: 230px;
      padding-right: 20px;
    }
  }
  
  @media (min-width: 992px) {
    body {
      padding: 45px;
    }
    
    h1 {
      font-size: 15px;
    }
    
    ul li {
      font-size: 13px;
      box-sizing: border-box;
      justify-content: flex-start;
    }
    
    ul li:hover i {
      opacity: 1;
    }
    
    ul li i {
      font-size: 10px;
      opacity: 0;
      margin-left: 10px;
      margin-top: 3px;
      padding-left: 0;
    }
  }
  </style>
</head>

<body>
  <main>
    <h1>
      <i>Index of&nbsp;</i>
${
paths.map(
  ({url, name}) => `
        <a href="/${url}">${name}</a>`
).join('')
}
    </h1>
    
    <ul>
${
files.map(
  ({relative, title, ext, base, size}) => `
      <li>
        <a href="/${relative}" title="${title}" class="${ext}">${base}</a>
        <i>${size}</i>
      </li>`
).join('')
}
    </ul>
  </main>
</body>
</html>`)
}




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
      fs.stat(path, (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') console.log(path + ' ain\'t there')
          else console.log('A more interesting error occurred!', err)
          return resolve(fetch(path))
        } else if (stats.isDirectory()) {
          console.log(path + ' is a Directory!')
          console.log('fs =', fs)
          fs.readdir(path, (err, data) => {
            if (err) return reject(err)
            // data = JSON.stringify(data, null, 2)
            console.log('data =', data)
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
          })
        } else {
          console.log('Holy crap we found ' + path + ' in the file system')
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