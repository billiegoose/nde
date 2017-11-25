/* global EventHub */
import React from 'react'
import {FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import pify from 'pify'
import { prompt } from '../SweetAlert'
import { init, clone, commit, push, checkout, fetch } from './GitActions'
import { rimraf } from './rimraf'

export default class ContextMenuFolder extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid()
    }
  }

  setFolderStateData = (key, value) =>
    EventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})

  newFile = async () =>
    pify(fs.writeFile)(path.join(this.props.filepath, await prompt('Enter filename:')), '')

  newFolder = async () =>
    pify(fs.mkdir)(path.join(this.props.filepath, await prompt('Enter foldername:')))

  deleteFolder = async () => await rimraf(this.props.filepath)

  renameFolder = async () =>
    pify(fs.rename)(this.props.filepath, path.join(path.dirname(this.props.filepath), await prompt('New folder name')))

  gitInit = () =>
    init({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })

  gitClone = () =>
    clone({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })

  gitPush = () =>
    push({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })

  gitCommit = () =>
    commit({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })

  gitCheckout = () =>
    checkout({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })

  gitFetch = () =>
    fetch({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })

  render () {
    let {disableContextMenu, filename, open, ...passedProps} = this.props
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        {this.props.children}
        <ContextMenu id={this.state.cuid}>
          <SubMenu title="Git" hoverDelay={50}>
            <MenuItem onClick={this.gitCommit}>
              Commit <Octicon name="git-commit" style={{color: 'black'}}/>
            </MenuItem>
            <SubMenu title="Repo" hoverDelay={50}>
              <MenuItem onClick={this.gitClone}>
                Clone <Octicon name="repo-clone" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={this.gitInit}>
                Init <Octicon name="repo" style={{color: 'black'}}/>
              </MenuItem>
            </SubMenu>
            <SubMenu title="Branch" hoverDelay={50}>
              <MenuItem disabled onClick={this.gitCheckout}>
                New Branch <Octicon name="git-branch" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={this.gitCheckout}>
                Checkout <Octicon name="git-commit" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={this.gitFetch}>
                Fetch <Octicon name="cloud-download" style={{color: 'black'}}/>
              </MenuItem>
              <MenuItem onClick={this.gitPush}>
                Push <Octicon name="cloud-upload" style={{color: 'black'}}/>
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <MenuItem onClick={this.newFile}>
            New File <i className="icon text-icon"></i>
          </MenuItem>
          <MenuItem onClick={this.newFolder}>
            New Folder <span style={{paddingTop: '3px', position: 'absolute', right: 0}}><FolderIcon></FolderIcon></span>
          </MenuItem>
          <MenuItem onClick={this.renameFolder}>
            Rename Folder <span style={{paddingTop: '3px', position: 'absolute', right: 0}}><FolderIcon></FolderIcon></span>
          </MenuItem>
          <MenuItem onClick={this.deleteFolder}>
            Delete Folder <i className="icon trash-icon"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}
