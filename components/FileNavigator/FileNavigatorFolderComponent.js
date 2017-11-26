import React from 'react'
import {Folder} from 'react-file-browser'
import fs from 'fs'
import { Buffer } from 'buffer'
import path from 'path'
import { DragSource, DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import ContextMenuFolder from './ContextMenuFolder'

const ItemTypes = {
  FILE: 'file',
  FOLDER: 'folder'
}
const folderSource = {
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
const folderTarget = {
  drop (props, monitor) {
    const item = monitor.getItem()
    // Handle drop-uploading of real files
    if (item.files) {
      for (let file of item.files) {
        const filename = path.join(props.filepath, file.name)
        console.log('file =', file)
        if (file.size > 0) {
          var fileReader = new FileReader()
          fileReader.onload = function () {
            fs.writeFile(filename, Buffer.from(this.result), (err) => console.log(err))
          }
          fileReader.readAsArrayBuffer(file)
        } else {
          fs.mkdir(filename, (err) => {
            console.log(err)
            alert('Created empty folder ' + filename)
          })
        }
      }
      return
    }

    // Handle FileNavigatorFileComponent drops
    const oldPath = item.filepath
    const oldName = item.filename
    const parentPath = props.filepath
    const newPath = path.join(parentPath, oldName)
    console.log(`I will move ${oldPath} to ${newPath}`)
    console.log(props)
    EventHub.emit('setFolderStateData', {fullpath: parentPath, key: 'busy', value: true})
    fs.rename(oldPath, newPath, (err) => {
      console.log(err)
      EventHub.emit('refreshGitStatus', oldPath)
      EventHub.emit('refreshGitStatus', newPath)
      EventHub.emit('setFolderStateData', {fullpath: parentPath, key: 'busy', value: false})
    })
  }
}
function targetCollect (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isDraggingOver: monitor.isOver()
  }
}

class FileNavigatorFolderComponent extends React.Component {
  click () {
    console.time(this.props.filepath)
    EventHub.emit('toggleFolder', this.props.filepath)
  }
  setFolderStateData (key, value) {
    EventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})
  }
  render () {
    let {disableContextMenu, filename, filepath, fileMap, open, connectDragSource, connectDragPreview, isDragging, connectDropTarget, isDraggingOver} = this.props
    let busyIcon = fileMap && fileMap[filepath] && fileMap[filepath].busy
      ? <span>&nbsp;<i className='fa fa-spinner fa-spin'></i></span>
      : ''
    let style = (fileMap && fileMap[filepath] && fileMap[filepath].progress !== undefined)
      ? {
        backgroundRepeat: 'no-repeat',
        backgroundImage: 'linear-gradient(to right, transparent, cyan 75%, transparent)',
        backgroundSize: `${fileMap[filepath].progress * 100}% 100%`
      }
      : {}
    let folder = connectDragPreview(
      <div>
        <Folder filename={filename} open={open} domProps={{
          onClick: this.click.bind(this),
          style
        }}>
          {busyIcon}
        </Folder>
      </div>
    )
    return connectDropTarget(connectDragSource(
      <div>
        <ContextMenuFolder filepath={this.props.filepath} disableContextMenu={this.props.disableContextMenu}>
          {folder}
        </ContextMenuFolder>
      </div>
    ))
  }
}

export default DragSource(ItemTypes.FOLDER, folderSource, collect)(
  DropTarget([ItemTypes.FOLDER, ItemTypes.FILE, NativeTypes.FILE], folderTarget, targetCollect)(
    FileNavigatorFolderComponent
  )
)
