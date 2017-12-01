import path from 'path'
import git from 'isomorphic-git'
try {
  git.utils.setfs(fs)
} catch (e) {
  console.log(e)
}
import ghparse from 'parse-github-url'

import { prompt } from '../SweetAlert'

export async function init ({filepath, glEventHub}) {
  await git(filepath).init()
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
    await git(dir)
      .depth(1)
      .onprogress(updateProgressBar)
      .clone(`https://cors-buster-jfpactjnem.now.sh/${proxyurl}`)
    await git(dir).config('remote.origin.host', new URL('https://' + proxyurl).hostname)
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('setFolderStateData', { fullpath: dir, key: 'busy', value: false })
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}

export async function push ({filepath, glEventHub}) {
  let host = 'https://' + await git(filepath).config('remote.origin.host')
  let helper = await git(filepath).config(`credential "${host}".helper`)
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
  let username = await git(filepath).config(`credential "${host}".username`)
  username = await git(filepath).config(`credential "${host}".username`)
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
      await git(filepath).config(`credential "${host}".helper`, 'navigator.credentials')
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
        await git(filepath).config(`credential "${host}".username`, username)
      }
    }
  }
  glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: true})
  try {
    await git(filepath)
      .auth(auth)
      .remote('origin')
      .push('refs/heads/master')
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('refreshGitStatus', filepath)
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: false})
  }
}

export async function stage ({filepath, glEventHub}) {
  let dir = await git().findRoot(filepath)
  let rpath = path.relative(dir, filepath)
  await git(dir).add(rpath)
  glEventHub.emit('refreshGitStatus', filepath)
}

export async function remove ({filepath, glEventHub}) {
  let dir = await git().findRoot(filepath)
  let rpath = path.relative(dir, filepath)
  await git(dir).remove(rpath)
  glEventHub.emit('refreshGitStatus', filepath)
}

export async function commit ({filepath, glEventHub}) {
  let author = await git(filepath).config('user.name')
  let email = await git(filepath).config('user.email')
  if (!author) {
    author = await prompt({
      text: 'Author Name',
      input: 'text'
    })
    git(filepath).config('user.name', author)
  }
  if (!email) {
    email = await prompt({
      text: 'Author Email',
      input: 'text'
    })
    git(filepath).config('user.email', email)
  }
  // signingkey = 9609B8A5928BA6B9
  let msg = await prompt({
    text: 'Commit Message',
    input: 'text'
  })
  try {
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: true})
    await git(filepath)
      .author(author)
      .email(email)
      .commit(msg)
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('refreshGitStatus', filepath)
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: false})
  }
}

export async function checkout ({filepath, glEventHub}) {
  let branches = await git(filepath).listBranches()
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
    await git(filepath)
      .checkout(ref)
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('refreshGitStatus', filepath)
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
    await git(filepath)
      .remote('origin')
      // .depth(1)
      .fetch(ref)
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}
