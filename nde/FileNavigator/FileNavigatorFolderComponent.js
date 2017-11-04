import React from 'react'
import {Folder, FileIcon, FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js"
import fs from 'fs'
import path from 'path'
import pify from 'pify'
import ContextMenuFolder from './ContextMenuFolder'
import { DragSource, DropTarget } from 'react-dnd'
 
const ItemTypes = {
    FILE: 'file',
    FOLDER: 'folder'
}
const folderSource = {
  beginDrag(props) {
    return {
      filename: props.filename,
      filepath: props.filepath
    }
  }
}
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}
const folderTarget = {
  drop(props, monitor) {
    const oldPath = monitor.getItem().filepath
    const oldName = monitor.getItem().filename
    const parentPath = props.filepath
    const newPath = path.join(parentPath, oldName)
    console.log(`I will move ${oldPath} to ${newPath}`)
    console.log(props)
    MotherLayout.eventHub.emit('setFolderStateData', {fullpath: parentPath, key: 'busy', value: true})
    fs.rename(oldPath, newPath, (err) => {
      console.log(err)
      MotherLayout.eventHub.emit('refreshGitStatus', oldPath)
      MotherLayout.eventHub.emit('refreshGitStatus', newPath)
      MotherLayout.eventHub.emit('setFolderStateData', {fullpath: parentPath, key: 'busy', value: false})
    })
  }
}
function targetCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isDraggingOver: monitor.isOver()
    }
}

class FileNavigatorFolderComponent extends React.Component {
  constructor () {
    super()
  }
  click () {
    MotherLayout.eventHub.emit('toggleFolder', this.props.filepath)
  }
  setFolderStateData (key, value) {
    MotherLayout.eventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})
  }
  render() {
    let {disableContextMenu, filename, open, connectDragSource, connectDragPreview, isDragging, connectDropTarget, isDraggingOver, ...passedProps} = this.props
    let busyIcon = passedProps.statedata && passedProps.statedata.busy
             ? <span>&nbsp;<i className='fa fa-spinner fa-spin'></i></span>
             : ''
    // let progressBar = <div style={{
    //   position: 'absolute',
    //   left: '0',
    //   top: '0',
    //   bottom: '0',
    //   width: '50%',
    //   backgroundColor: 'navy'
    // }}></div>
    let progressPercent = 0.50
    let style = (passedProps.statedata && passedProps.statedata.progress !== undefined)
      ? {
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'linear-gradient(to right, transparent, cyan 75%, transparent)',
          backgroundSize: `${passedProps.statedata.progress * 100}% 100%`
        }
      : {}
    let folder = connectDragPreview(
      <div>
        <Folder filename={filename} open={open} domProps={{
          onClick:this.click.bind(this),
          style
          }}>
          {busyIcon}
        </Folder>
      </div>
    )
    return connectDropTarget(connectDragSource(
      <div>
        <ContextMenuFolder filepath={this.props.filepath} disableContextMenu={this.props.disableContextMenu} glEventHub={MotherLayout.eventHub}>
          {folder}
        </ContextMenuFolder>
      </div>
    ))
  }
}

export default DragSource(ItemTypes.FOLDER, folderSource, collect)(
    DropTarget(ItemTypes.FOLDER, folderTarget, targetCollect)(
        FileNavigatorFolderComponent
    )
)