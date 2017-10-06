global = self
importScripts('/nde/builtins/browserfs.js')
importScripts('/nde/deps/mime/bundle.js')
importScripts('https://unpkg.com/omnipath@1.1.5/dist/omnipath.min.js')

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
              index:{"index.html":null,"index.json":null,"LICENSE":null,"nde":{"app.css":null,"app.js":null,"builtins":{"browserfs.js":null,"browserfs.js.map":null,"buffer.js":null,"fs.js":null},"deps":{"mime":{"bundle.js":null},"monaco":{"CHANGELOG.md":null,"dev":{"bundleInfo.json":null,"nls.metadata.json":null,"vs":{"base":{"worker":{"workerMain.js":null,"workerMain.js.map":null}},"basic-languages":{"src":{"bat.js":null,"coffee.js":null,"cpp.js":null,"csharp.js":null,"css.js":null,"dockerfile.js":null,"fsharp.js":null,"go.js":null,"handlebars.js":null,"html.js":null,"ini.js":null,"java.js":null,"less.js":null,"lua.js":null,"markdown.js":null,"msdax.js":null,"objective-c.js":null,"php.js":null,"postiats.js":null,"powershell.js":null,"pug.js":null,"python.js":null,"r.js":null,"razor.js":null,"ruby.js":null,"sb.js":null,"scss.js":null,"solidity.js":null,"sql.js":null,"swift.js":null,"vb.js":null,"xml.js":null,"yaml.js":null}},"editor":{"contrib":{"suggest":{"browser":{"media":{"String_16x.svg":null,"String_inverse_16x.svg":null}}}},"editor.main.css":null,"editor.main.js":null,"editor.main.js.map":null,"editor.main.nls.de.js":null,"editor.main.nls.es.js":null,"editor.main.nls.fr.js":null,"editor.main.nls.hu.js":null,"editor.main.nls.it.js":null,"editor.main.nls.ja.js":null,"editor.main.nls.js":null,"editor.main.nls.ko.js":null,"editor.main.nls.pt-br.js":null,"editor.main.nls.ru.js":null,"editor.main.nls.tr.js":null,"editor.main.nls.zh-cn.js":null,"editor.main.nls.zh-tw.js":null,"standalone":{"browser":{"quickOpen":{"symbol-sprite.svg":null}}}},"language":{"css":{"cssMode.js":null,"cssWorker.js":null},"html":{"htmlMode.js":null,"htmlWorker.js":null},"json":{"jsonMode.js":null,"jsonWorker.js":null},"typescript":{"lib":{"typescriptServices.js":null},"src":{"mode.js":null,"worker.js":null}}},"loader.js":null,"loader.js.map":null}},"LICENSE":null,"min":{"vs":{"base":{"worker":{"workerMain.js":null}},"basic-languages":{"src":{"bat.js":null,"coffee.js":null,"cpp.js":null,"csharp.js":null,"css.js":null,"dockerfile.js":null,"fsharp.js":null,"go.js":null,"handlebars.js":null,"html.js":null,"ini.js":null,"java.js":null,"less.js":null,"lua.js":null,"markdown.js":null,"msdax.js":null,"objective-c.js":null,"php.js":null,"postiats.js":null,"powershell.js":null,"pug.js":null,"python.js":null,"r.js":null,"razor.js":null,"ruby.js":null,"sb.js":null,"scss.js":null,"solidity.js":null,"sql.js":null,"swift.js":null,"vb.js":null,"xml.js":null,"yaml.js":null}},"editor":{"contrib":{"suggest":{"browser":{"media":{"String_16x.svg":null,"String_inverse_16x.svg":null}}}},"editor.main.css":null,"editor.main.js":null,"editor.main.nls.de.js":null,"editor.main.nls.es.js":null,"editor.main.nls.fr.js":null,"editor.main.nls.hu.js":null,"editor.main.nls.it.js":null,"editor.main.nls.ja.js":null,"editor.main.nls.js":null,"editor.main.nls.ko.js":null,"editor.main.nls.pt-br.js":null,"editor.main.nls.ru.js":null,"editor.main.nls.tr.js":null,"editor.main.nls.zh-cn.js":null,"editor.main.nls.zh-tw.js":null,"standalone":{"browser":{"quickOpen":{"symbol-sprite.svg":null}}}},"language":{"css":{"cssMode.js":null,"cssWorker.js":null},"html":{"htmlMode.js":null,"htmlWorker.js":null},"json":{"jsonMode.js":null,"jsonWorker.js":null},"typescript":{"lib":{"typescriptServices.js":null},"src":{"mode.js":null,"worker.js":null}}},"loader.js":null}},"min-maps":{"vs":{"base":{"worker":{"workerMain.js.map":null}},"editor":{"editor.main.js.map":null,"editor.main.nls.de.js.map":null,"editor.main.nls.es.js.map":null,"editor.main.nls.fr.js.map":null,"editor.main.nls.hu.js.map":null,"editor.main.nls.it.js.map":null,"editor.main.nls.ja.js.map":null,"editor.main.nls.js.map":null,"editor.main.nls.ko.js.map":null,"editor.main.nls.pt-br.js.map":null,"editor.main.nls.ru.js.map":null,"editor.main.nls.tr.js.map":null,"editor.main.nls.zh-cn.js.map":null,"editor.main.nls.zh-tw.js.map":null},"loader.js.map":null}},"monaco.d.ts":null,"package.json":null,"README.md":null,"ThirdPartyNotices.txt":null}},"EditableTextFile.js":null,"FileNavigator":{"FileNavigator.js":null,"FileNavigatorFileComponent.js":null,"FileNavigatorFolderComponent.js":null,"StatusIcon.js":null},"MarkdownViewer.js":null,"packages":{"FileTreeView":{"atom-styles.css":null,"Example.js":null,"File.js":null,"FileIcon.js":null,"FileList.js":null,"Folder.js":null,"FolderIcon.js":null,"index.js":null},"react-octicons-modular":{"index.js":null}},"react-contextmenu.css":null,"SweetAlert.js":null,"TryCatchHOC.js":null},"package.json":null,"README.md":null,"service-worker.js":null}
            }
          }
        }
      }
    }
  }, (err) => err ? reject(err) : resolve(BrowserFS.BFSRequire('fs')))
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
  ext: OmniPath.ext(filename).replace(/^\./, ''),
  base: OmniPath.base(filename),
  relative: OmniPath.join(dirname, filename),
  title: OmniPath.base(filename),
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
  if (path === '/') path = '/index.html' // TODO: Do I have to do all the path normalization logic normally handled by the server?
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