import React from 'react'
import {Folder, FileIcon, FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import git from 'isomorphic-git'
import { prompt } from '../SweetAlert'
import swal from 'sweetalert2'
import ghparse from 'parse-github-url'

export default class FileNavigatorFolderComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid(),
    }
  }
  click () {
    this.props.glEventHub.emit('toggleFolder', this.props.filepath)
  }
  setFolderStateData (key, value) {
    this.props.glEventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})
  }
  async newFile () {
    let filename = await prompt('Enter filename:')
    fs.writeFile(path.join(this.props.filepath, filename), '')
  }
  async newFolder () {
    fs.mkdir(path.join(this.props.filepath, await prompt('Enter foldername:')))
  }
  async deleteFolder () {
    fs.rmdir(this.props.filepath)
  }
  gitInit () {
    git(this.props.filepath).init()
  }
  async gitClone () {
    let url = await prompt({
      text: 'Github repo to clone',
      input: 'text',
      placeholder: 'user/repo',
      confirmButtonText: 'Clone Now'
    })
    let {branch, repo, name, owner} = ghparse(url)
    this.setFolderStateData('busy', true)
    let dir = path.join(this.props.filepath, name)
    this.props.glEventHub.emit('setFolderStateData', {fullpath: dir, key: 'busy', value: true})
    try {
      await git(dir)
        .depth(1)
        .branch(branch)
        .clone(`https://cors-buster-jfpactjnem.now.sh/github.com/${repo}`)
    } catch (err) {
      console.log('err =', err)
    } finally {
      this.props.glEventHub.emit('setFolderStateData', {fullpath: dir, key: 'busy', value: false})
      this.setFolderStateData('busy', false)
    }
  }
  async gitPush () {
    let token = await prompt({
      text: 'Enter a Github Personal Access Token to use',
      input: 'password'
    })
    this.setFolderStateData('busy', true)
    try {
      await git(this.props.filepath)
        .auth(token)
        .remote('origin')
        .push('refs/heads/master')
    } catch (err) {
      console.log('err =', err)
    } finally {
      this.props.glEventHub.emit('refreshGitStatus', this.props.filepath)
      this.setFolderStateData('busy', false)
    }
  }
  async gitCommit () {
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
      this.setFolderStateData('busy', true)
      await git(this.props.filepath)
        .author(author)
        .email(email)
        .commit(msg)
    } catch (err) {
      console.log('err =', err)
    } finally {
      this.props.glEventHub.emit('refreshGitStatus', this.props.filepath)
      this.setFolderStateData('busy', false)
    }
  }
  render() {
    let {disableContextMenu, filename, open, ...passedProps} = this.props
    let busyIcon = passedProps.statedata && passedProps.statedata.busy
             ? <span>&nbsp;<i className='fa fa-spinner fa-spin'></i></span>
             : ''
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        <Folder filename={filename} open={open} domProps={{onClick:this.click.bind(this)}}>
          {busyIcon}
        </Folder>

        <ContextMenu id={this.state.cuid}>
          <SubMenu title="Git" hoverDelay={50}>
            <MenuItem onClick={() => this.gitInit()}>
              Init <Octicon name="repo" style={{color: 'black'}}/>
            </MenuItem>
            <MenuItem onClick={() => this.gitClone()}>
              Clone <Octicon name="repo-clone" style={{color: 'black'}}/>
            </MenuItem>
            <MenuItem onClick={() => this.gitCommit()}>
              Commit <Octicon name="git-commit" style={{color: 'black'}}/>
            </MenuItem>
            <MenuItem onClick={() => this.gitPush()}>
              Push <Octicon name="repo-push" style={{color: 'black'}}/>
            </MenuItem>
          </SubMenu>
          <MenuItem onClick={() => this.newFile()}>
            New File <i className="icon text-icon"></i>
          </MenuItem>
          <MenuItem onClick={() => this.newFolder()}>
            New Folder <span style={{paddingTop: '3px', position: 'absolute', right: 0}}><FolderIcon></FolderIcon></span>
          </MenuItem>
          <MenuItem onClick={() => this.deleteFolder()}>
            Delete Folder <i className="icon trash-icon"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}