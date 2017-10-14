import fs from 'fs'
import path from 'path'
import pify from 'pify'
import git from 'isomorphic-git'
import { prompt } from '../SweetAlert'
import swal from 'sweetalert2'
import ghparse from 'parse-github-url'

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
    try {
        await git(dir)
            .depth(1)
            .clone(`https://cors-buster-jfpactjnem.now.sh/${proxyurl}`)
    } catch (err) {
        console.log('err =', err)
    } finally {
        glEventHub.emit('setFolderStateData', { fullpath: dir, key: 'busy', value: false })
        glEventHub.emit('setFolderStateData', { fullpath: filepath, key: 'busy', value: false })
    }
}

export async function push ({filepath, glEventHub}) {
    let token = await prompt({
      text: 'Enter auth to use',
      input: 'password'
    })
    glEventHub.emit('setFolderStateData', {fullpath: filepath, key: 'busy', value: true})
    try {
      await git(filepath)
        .auth(token)
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
  let author = await prompt({
    text: 'Author Name',
    input: 'text'
  })
  let email = await prompt({
    text: 'Author Email',
    input: 'text'
  })
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

