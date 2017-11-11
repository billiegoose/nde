import fs from 'fs'
import path from 'path'
import pify from 'pify'
import git from 'isomorphic-git'
import swal from 'sweetalert2'
import ghparse from 'parse-github-url'

import { prompt } from '../SweetAlert'

function setFolderStateData (key, value) {
  glEventHub.emit('setFolderStateData', {fullpath: filepath, key, value})
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
  let host = await git(filepath).config('remote.origin.host')
  let helper = await git(filepath).config(`credential."${host}".helper`)
  let auth = null
  // WIP: Prompt to save push credentials in the browser credential manager
  if (helper === 'navigator.credentials' && navigator.credentials && navigator.credentials.preventSilentAccess) {
    // The new Credential Management API is available
    let cred = await navigator.credentials.get({
      federated: {
        providers: [host]
      }
    })
    if (cred) {
      auth = atob(cred.id) // I obfuscated this slightly because it *is* shown in the UI. :(
    }
  }
  let username = await git(filepath).config(`credential."${host}".username`)
  username = await git(filepath).config(`credential."${host}".username`)
  const usernameHelper = username ? true : false
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
  if (!usernameHelper && navigator.credentials && navigator.credentials.preventSilentAccess) {
    // The new Credential Management API is available
    let cred = await navigator.credentials.create({
      federated: {
        provider: 'https://' + host,
        name: username,
        id: btoa(auth) // I obfuscate this slightly because it *is* shown in the UI. :(
      }
    })
    cred = await navigator.credentials.store(cred)
    if (cred) {
      navigator.credentials.preventSilentAccess() // Mitigate XSS attacks
      await git(filepath).config(`credential."${host}".helper`, 'navigator.credentials')
    } else {
      // let offer = await prompt({
      //   title: 'Opt out of password manager integration',
      //   inputPlaceholder: `Don't offer to remember this again`,
      //   input: 'checkbox'
      // })
      // if (offer) {
      //   // Use the presense of the username helper to indicate we DON'T want the password helper
      //   // Yes this is totally batshit, I will fix this in the future. Don't blame me, blame the coffee.
      //   await git(filepath).config(`credential."${host}".username`, username)
      // }
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
      //.depth(1)
      .fetch(ref)
  } catch (err) {
    console.log('err =', err)
  } finally {
    glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
  }
}
