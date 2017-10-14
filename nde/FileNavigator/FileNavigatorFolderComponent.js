import React from 'react'
import {Folder, FileIcon, FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import path from 'path'
import pify from 'pify'
import ContextMenuFolder from './ContextMenuFolder'

export default class FileNavigatorFolderComponent extends React.Component {
  constructor () {
    super()
  }
  click () {
    this.props.glEventHub.emit('toggleFolder', this.props.filepath)
  }
  setFolderStateData (key, value) {
    this.props.glEventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})
  }
  render() {
    let {disableContextMenu, filename, open, ...passedProps} = this.props
    let busyIcon = passedProps.statedata && passedProps.statedata.busy
             ? <span>&nbsp;<i className='fa fa-spinner fa-spin'></i></span>
             : ''
    return (
      <ContextMenuFolder filepath={this.props.filepath} disableContextMenu={this.props.disableContextMenu} glEventHub={this.props.glEventHub}>
        <Folder filename={filename} open={open} domProps={{onClick:this.click.bind(this)}}>
          {busyIcon}
        </Folder>
      </ContextMenuFolder>
    )
  }
}