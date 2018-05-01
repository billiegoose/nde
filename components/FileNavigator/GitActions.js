import path from 'path'
import * as git from 'isomorphic-git'
import ghparse from 'parse-github-url'
import { GitWorker } from 'isomorphic-git-worker'

import { prompt } from '../SweetAlert'

export async function init ({ filepath, glEventHub }) {
  const dir = filepath
  try {
    console.log(GitWorker)
    await GitWorker.init({ dir })
    console.log('ya')
  } catch (err) {
    console.log(err)
  }
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
    await git.clone({
      fs,
      dir,
      depth: 1,
      onprogress: updateProgressBar,
      url: `https://cors-buster-jfpactjnem.now.sh/${proxyurl}`
    })
    await git.config({
      fs,
      dir,
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

export async function push({ filepath, glEventHub }) {
  const dir = filepath
  let host = 'https://' + await git.config({fs, dir, path: 'remote.origin.host'})
  let helper = await git.config({fs, dir, path: `credential "${host}".helper`})
  let authPassword = null
  let authUsername = null
  // WIP: Prompt to save push credentials in the browser credential manager
  if (helper === 'navigator.credentials' && navigator.credentials && navigator.credentials.preventSilentAccess) {
    // The new Credential Management API is available
    let cred = await navigator.credentials.get({
      password: true,
      mediation: 'required'
    })
    await navigator.credentials.preventSilentAccess()
    if (cred) {
      authUsername = cred.id
      authPassword = cred.password
    }
  }
  if (authUsername === null) {
    authUsername = await git.config({ fs, dir, path: `credential "${host}".username` })
  }
  const offerStorePassword = !!((!authPassword && !authUsername))
  if (authPassword === null) {
    authUsername = authUsername || await prompt({
      text: `Enter username (for ${host})`,
      input: 'text'
    })
    let token = await prompt({
      text: `Enter access token`,
      input: 'password'
    })
    authPassword = token
  }
  // WIP: Prompt to save push credentials in the browser credential manager
  if (offerStorePassword && navigator.credentials && navigator.credentials.preventSilentAccess) {
    // The new Credential Management API is available
    let cred = await navigator.credentials.create({
      password: {
        id: authUsername,
        name: host,
        iconURL: host + '/favicon.ico',
        password: authPassword
      }
    })
    try {
      // TODO: Awaiting a response from the @ChromiumDev team as to how to tell whether the
      // password was stored successfully or not.
      let c = await navigator.credentials.store(cred)
      console.log('saving to config', c)
      await git.config({fs, dir, path: `credential "${host}".helper`, value: 'navigator.credentials'})
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
        await git.config({fs, dir, path: `credential "${host}".username`, value: authUsername})
      }
    }
  }
  glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: true})
  try {
    await git.push({
      fs,
      dir,
      authUsername,
      authPassword,
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
  let dir = await git.findRoot({fs, filepath})
  let rpath = path.relative(dir, filepath)
  await git.add({fs, dir, filepath: rpath})
  glEventHub.emit('refreshGitStatusFile', filepath)
}

export async function remove ({filepath, glEventHub}) {
  let dir = await git.findRoot({fs, filepath})
  let rpath = path.relative(dir, filepath)
  await git.remove({fs, dir, filepath: rpath})
  glEventHub.emit('refreshGitStatusFile', filepath)
}

export async function commit ({filepath, glEventHub}) {
  const dir = filepath
  let author = await git.config({fs, dir, path: 'user.name'})
  let email = await git.config({fs, dir, path: 'user.email'})
  if (!author) {
    author = await prompt({
      text: 'Author Name',
      input: 'text'
    })
    await git.config({fs, dir, path: 'user.name', value: author})
  }
  if (!email) {
    email = await prompt({
      text: 'Author Email',
      input: 'text'
    })
    await git.config({fs, dir, path: 'user.email', value: email})
  }
  // signingkey = 9609B8A5928BA6B9
  let msg = await prompt({
    text: 'Commit Message',
    input: 'text'
  })
  try {
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: true})
    await git.commit({
      fs,
      dir,
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
  const dir = filepath
  let branches = await git.listBranches({fs, dir})
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
    await git.checkout({fs, dir, ref})
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('refreshGitStatusDir', filepath)
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}

export async function fetch({ filepath, glEventHub }) {
  const dir = filepath
  let ref = await prompt({
    title: 'Fetch branch',
    text: 'Name of remote branch',
    input: 'text',
    confirmButtonText: 'Fetch',
    showCancelButton: true
  })
  glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: true })
  try {
    await git.fetch({
      fs,
      dir,
      remote: 'origin',
      ref
    })
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}
