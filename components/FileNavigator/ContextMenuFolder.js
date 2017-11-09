import React from 'react'
import {FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu/dist/react-contextmenu.js';
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import pify from 'pify'
import git from 'isomorphic-git'
import { prompt } from '../SweetAlert'
import swal from 'sweetalert2'
import { clone, commit, push, checkout, fetch } from './GitActions'

export default class ContextMenuFolder extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid(),
    }
  }
  click () {
    EventHub.emit('toggleFolder', this.props.filepath)
  }
  setFolderStateData (key, value) {
    EventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})
  }
  async newFile () {
    let filename = await prompt('Enter filename:')
    return pify(fs.writeFile)(path.join(this.props.filepath, filename), '')
  }
  async newFolder () {
    return pify(fs.mkdir)(path.join(this.props.filepath, await prompt('Enter foldername:')))
  }
  async deleteFolder () {
    return pify(fs.rmdir)(this.props.filepath)
  }
  async renameFolder () {
    let name = await prompt('New folder name')
    return pify(fs.rename)(this.props.filepath, path.join(path.dirname(this.props.filepath), name))
  }
  async gitInit () {
    return git(this.props.filepath).init()
  }
  async gitClone () {
    await clone({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })
  }
  async gitPush () {
    await push({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })
  }
  async gitCommit () {
    await commit({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })
  }
  async gitCheckout () {
    await checkout({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })
  }
  async gitFetch () {
    await fetch({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })
  }
  render() {
    let {disableContextMenu, filename, open, ...passedProps} = this.props
    let busyIcon = passedProps.statedata && passedProps.statedata.busy
             ? <span>&nbsp;<i className='fa fa-spinner fa-spin'></i></span>
             : ''
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        {this.props.children}
        <ContextMenu id={this.state.cuid}>
          <SubMenu title="Git" hoverDelay={50}>
            <MenuItem onClick={() => this.gitCommit()}>
              Commit <Octicon name="git-commit" style={{color: 'black'}}/>
            </MenuItem>
            <SubMenu title="Repo" hoverDelay={50}>
              <MenuItem onClick={() => this.gitClone()}>
                Clone <Octicon name="repo-clone" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={() => this.gitInit()}>
                Init <Octicon name="repo" style={{color: 'black'}}/>
              </MenuItem>
            </SubMenu>
            <SubMenu title="Branch" hoverDelay={50}>
              <MenuItem disabled onClick={() => this.gitCheckout()}>
                New Branch <Octicon name="git-branch" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={() => this.gitCheckout()}>
                Checkout <Octicon name="git-commit" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={() => this.gitFetch()}>
                Fetch <Octicon name="cloud-download" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={() => this.gitPush()}>
                Push <Octicon name="cloud-upload" style={{color: 'black'}}/>
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <MenuItem onClick={() => this.newFile()}>
            New File <i className="icon text-icon"></i>
          </MenuItem>
          <MenuItem onClick={() => this.newFolder()}>
            New Folder <span style={{paddingTop: '3px', position: 'absolute', right: 0}}><FolderIcon></FolderIcon></span>
          </MenuItem>
          <MenuItem onClick={() => this.renameFolder()}>
            Rename Folder <span style={{paddingTop: '3px', position: 'absolute', right: 0}}><FolderIcon></FolderIcon></span>
          </MenuItem>
          <MenuItem onClick={() => this.deleteFolder()}>
            Delete Folder <i className="icon trash-icon"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}