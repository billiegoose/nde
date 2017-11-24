import React from 'react'
import {File, FileIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import fs from 'fs'
import path from 'path'
import pify from 'pify'
import cuid from 'cuid'
import { DragSource } from 'react-dnd'

import StatusIcon from './StatusIcon'

class FileNavigatorFileComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid()
    }
  }
  doubleclick () {
    EventHub.emit('openFile', this.props.filepath)
  }
  deleteFile () {
    fs.unlink(this.props.filepath)
  }
  async renameFile () {
    let name = await prompt('New file name')
    return pify(fs.rename)(this.props.filepath, path.join(path.dirname(this.props.filepath), name))
  }
  async copyFile () {
    let name = await prompt('Copy file as')
    let newfile = path.resolve(path.dirname(this.props.filepath), name)
    fs.readFile(this.props.filepath, (err, buf) =>
      fs.writeFile(newfile, buf, () =>
        EventHub.emit('refreshGitStatus', newfile)
      )
    )
  }
  async addToIndex () {
    let dir = await git().findRoot(this.props.filepath)
    let rpath = path.relative(dir, this.props.filepath)
    await git(dir).add(rpath)
    EventHub.emit('refreshGitStatus', this.props.filepath)
  }
  render () {
    let {disableContextMenu, filename, filepath, fileMap, connectDragSource, connectDragPreview, isDragging, connectDropTarget, isDraggingOver, ...passedProps} = this.props
    let file = connectDragSource(connectDragPreview(
      <div>
        <File filename={filename} domProps={{onDoubleClick: this.doubleclick.bind(this)}}>
          &nbsp;<StatusIcon status={fileMap && fileMap[filepath] && fileMap[filepath].gitstatus || 'unmodified'} />
        </File>
      </div>
    ))
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        {file}
        <ContextMenu id={this.state.cuid}>
          <MenuItem onClick={() => this.addToIndex()}>
            Add to Stage <i className="icon git-icon medium-red"></i>
          </MenuItem>
          <MenuItem onClick={() => this.copyFile()}>
            Copy File <i className="icon fa fa-clone"></i>
          </MenuItem>
          <MenuItem onClick={() => this.renameFile()}>
            Rename File <i className="icon fa fa-i-cursor"></i>
          </MenuItem>
          <MenuItem onClick={() => this.deleteFile()}>
            Delete File <i className="icon fa fa-trash"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}

const ItemTypes = {
  FILE: 'file',
  FOLDER: 'folder'
}
const fileSource = {
  beginDrag (props) {
    return {
      filename: props.filename,
      filepath: props.filepath
    }
  }
}

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

export default DragSource(ItemTypes.FILE, fileSource, collect)(
  FileNavigatorFileComponent
)
