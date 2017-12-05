/* global EventHub */
import React from 'react'
import {File} from 'react-file-browser'
import { DragSource } from 'react-dnd'

import ContextMenuFile from './ContextMenuFile'
import StatusIcon from './StatusIcon'
import { EditableFilename } from './EditableFilename'

class FileNavigatorFileComponent extends React.Component {
  doubleclick () {
    EventHub.emit('openFile', this.props.filepath)
  }
  rename () {
    
  }
  render () {
    let {disableContextMenu, filename, filepath, fileMap, connectDragSource, connectDragPreview, isDragging, connectDropTarget, isDraggingOver} = this.props
    let editingName = (fileMap && fileMap[filepath] && fileMap[filepath].editingName === true)
    let tentativeFilename = (fileMap && fileMap[filepath] && fileMap[filepath].tentativeFilename)
    let file = connectDragSource(connectDragPreview(
      <div>
        <File filename={filename} domProps={{onDoubleClick: this.doubleclick.bind(this)}}>
          <EditableFilename filepath={filepath} filename={filename} editing={editingName} tentativeFilename={tentativeFilename}/>&nbsp;<StatusIcon status={fileMap && fileMap[filepath] && (fileMap[filepath].gitstatus || 'unmodified')} />
        </File>
      </div>
    ))
    return (
      <ContextMenuFile filepath={filepath} disable={disableContextMenu}>
        {file}
      </ContextMenuFile>
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
