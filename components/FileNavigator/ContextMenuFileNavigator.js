/* global EventHub */
import React from 'react'
import { FolderIcon } from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import pify from 'pify'
import { prompt } from '../SweetAlert'
import { clone } from './GitActions'

export default class ContextMenuFileNavigator extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid()
    }
  }

  newFile = async () =>
    pify(fs.writeFile)(path.join(this.props.filepath, await prompt('Enter filename:')), '')

  newFolder = async () =>
    pify(fs.mkdir)(path.join(this.props.filepath, await prompt('Enter foldername:')))

  gitClone = () =>
    clone({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })

  uninstall = async () => {
    let keys = await caches.keys()
    for (let key of keys) {
      caches.delete(key)
    }
    localStorage.clear()
    sessionStorage.clear()
    indexedDB.deleteDatabase('getlibs')
    indexedDB.deleteDatabase('browserfs')
    let registrations = await navigator.serviceWorker.getRegistrations()
    for (let registration of registrations) {
      registration.unregister()
    }
    location.reload(true)
  }

  render () {
    let {disableContextMenu, filename, open, ...passedProps} = this.props
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        {this.props.children}
        <ContextMenu id={this.state.cuid}>
          <MenuItem onClick={this.gitClone}>
            Clone <Octicon name="repo-clone" style={{color: 'black'}}/>
          </MenuItem>
          <MenuItem onClick={this.newFile}>
            New File <i className="icon text-icon"></i>
          </MenuItem>
          <MenuItem onClick={this.newFolder}>
            New Folder <span style={{paddingTop: '3px', position: 'absolute', right: 0}}><FolderIcon open={true}></FolderIcon></span>
          </MenuItem>
          <MenuItem onClick={this.newFolder}>
            Install nde <span style={{position: 'absolute', right: '3px'}}><i className="fa fa-fw fa-download"></i></span>
          </MenuItem>
          <MenuItem onClick={this.uninstall}>
            Uninstall nde <span style={{position: 'absolute', right: '3px'}}><i className="fa fa-fw fa-bomb"></i></span>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}
