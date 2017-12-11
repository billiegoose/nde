import path from 'path'
import { Git,
  init as ginit,
  clone as gclone,
  config as gconfig,
  push as gpush,
  add as gadd,
  findRoot as gfindRoot,
  remove as gremove,
  commit as gcommit,
  checkout as gcheckout,
  listBranches as glistBranches,
  fetch as gfetch
} from 'isomorphic-git'
console.log('Git', Git)
import ghparse from 'parse-github-url'

import { prompt } from '../SweetAlert'

export async function init ({filepath, glEventHub}) {
  let repo = new Git({fs, dir: filepath})
  await ginit(repo)
}

export async function clone ({filepath, glEventHub}) {
  let url = await prompt({
    text: 'Git URL to clone',
    input: 'text',
    placeholder: 'https://github.com/',
    confirmButtonText: 'Clone Now'
  })
  glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: true })
  let dir = path.join(filepath, path.basename(url))
  let proxyurl = url.replace(/^https?:\/\//, '')
  glEventHub.emit('setFolderStateData', { fullpath: dir, key: 'busy', value: true })
  const updateProgressBar = (e) => {
    let value = e.loaded === e.total ? undefined : e.loaded / e.total
    glEventHub.emit('setFolderStateData', { fullpath: dir, key: 'progress', value })
  }
  try {
    let repo = new Git({fs, dir})
    await gclone(repo, {
      depth: 1,
      onprogress: updateProgressBar,
      url: `https://cors-buster-jfpactjnem.now.sh/${proxyurl}`
    })
    await gconfig(repo, {
      path: 'remote.origin.host',
      value: new URL('https://' + proxyurl).hostname
    })
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('setFolderStateData', { fullpath: dir, key: 'busy', value: false })
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}

export async function push ({filepath, glEventHub}) {
  let repo = new Git({fs, dir: filepath})
  let host = 'https://' + await gconfig(repo, {path: 'remote.origin.host'})
  let helper = await gconfig(repo, {path: `credential "${host}".helper`})
  let auth = null
  // WIP: Prompt to save push credentials in the browser credential manager
  if (helper === 'navigator.credentials' && navigator.credentials && navigator.credentials.preventSilentAccess) {
    // The new Credential Management API is available
    let cred = await navigator.credentials.get({
      password: true,
      mediation: 'required'
    })
    await navigator.credentials.preventSilentAccess()
    if (cred) {
      auth = cred.password
    }
  }
  let username = await gconfig(repo, {path: `credential "${host}".username`})
  username = await gconfig(repo, {path: `credential "${host}".username`})
  const offerStorePassword = !!((!auth && !username))
  if (auth === null) {
    username = username || await prompt({
      text: `Enter username (for ${host})`,
      input: 'text'
    })
    let token = await prompt({
      text: `Enter access token`,
      input: 'password'
    })
    auth = `${username}:${token}`
  }
  // WIP: Prompt to save push credentials in the browser credential manager
  if (offerStorePassword && navigator.credentials && navigator.credentials.preventSilentAccess) {
    // The new Credential Management API is available
    let cred = await navigator.credentials.create({
      password: {
        id: username,
        name: host,
        iconURL: host + '/favicon.ico',
        password: auth
      }
    })
    try {
      // TODO: Awaiting a response from the @ChromiumDev team as to how to tell whether the
      // password was stored successfully or not.
      let c = await navigator.credentials.store(cred)
      console.log('saving to config', c)
      await gconfig(repo, {path: `credential "${host}".helper`, value: 'navigator.credentials'})
      await navigator.credentials.preventSilentAccess() // Mitigate XSS attacks
    } catch (err) {
      let offer = await prompt({
        title: 'Opt out of password manager integration',
        inputPlaceholder: `Don't offer to remember this again`,
        input: 'checkbox'
      })
      if (offer) {
        // Use the presense of the username helper to indicate we DON'T want the password helper
        // Yes this is totally batshit, I will fix this in the future. Don't blame me, blame the coffee.
        await gconfig(repo, {path: `credential "${host}".username`, value: username})
      }
    }
  }
  glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: true})
  try {
    await gpush(repo, {
      authUsername: auth,
      authPassword: auth,
      remote: 'origin',
      ref: 'refs/heads/master'
    })
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('refreshGitStatusDir', filepath)
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: false})
  }
}

export async function stage ({filepath, glEventHub}) {
  let dir = await gfindRoot({fs}, {filepath})
  let rpath = path.relative(dir, filepath)
  let repo = new Git({fs, dir})
  await gadd(repo, {filepath: rpath})
  glEventHub.emit('refreshGitStatusFile', filepath)
}

export async function remove ({filepath, glEventHub}) {
  let dir = await gfindRoot({fs}, {filepath})
  let rpath = path.relative(dir, filepath)
  let repo = new Git({fs, dir})
  await gremove(repo, {filepath: rpath})
  glEventHub.emit('refreshGitStatusFile', filepath)
}

export async function commit ({filepath, glEventHub}) {
  let repo = new Git({fs, dir: filepath})
  let author = await gconfig(repo, {path: 'user.name'})
  let email = await gconfig(repo, {path: 'user.email'})
  if (!author) {
    author = await prompt({
      text: 'Author Name',
      input: 'text'
    })
    await gconfig(repo, {path: 'user.name', value: author})
  }
  if (!email) {
    email = await prompt({
      text: 'Author Email',
      input: 'text'
    })
    await gconfig(repo, {path: 'user.email', value: email})
  }
  // signingkey = 9609B8A5928BA6B9
  let msg = await prompt({
    text: 'Commit Message',
    input: 'text'
  })
  try {
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: true})
    await gcommit(repo, {
      author: {
        name: author,
        email: email
      },
      message: msg
    })
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('refreshGitStatusDir', filepath)
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: false})
  }
}

export async function checkout ({filepath, glEventHub}) {
  let repo = new Git({fs, dir: filepath})
  let branches = await glistBranches(repo)
  let branchesObject = {}
  for (let b of branches) {
    branchesObject[b] = b
  }
  let ref = await prompt({
    title: 'Checkout branch',
    text: 'Select branch',
    input: 'select',
    inputOptions: branchesObject,
    confirmButtonText: 'Checkout',
    showCancelButton: true
  })
  glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: true })
  try {
    await gcheckout(repo, {ref})
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('refreshGitStatusDir', filepath)
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}

export async function fetch ({filepath, glEventHub}) {
  let ref = await prompt({
    title: 'Fetch branch',
    text: 'Name of remote branch',
    input: 'text',
    confirmButtonText: 'Fetch',
    showCancelButton: true
  })
  glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: true })
  try {
    await gfetch(repo, {
      remote: 'origin',
      ref
    })
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}
