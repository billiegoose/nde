/* global EventHub */
import React from 'react'
import path from 'path'
import { GitWorker } from 'isomorphic-git-worker'
import { Buffer } from 'buffer'
import TextEditor from './TextEditor'
import { DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

const style = {
  backgroundColor: '#1e1e1e',
  color: 'white',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: '2em'
}

class FileEditor extends React.Component {
  render () {
    let {filepath, connectDropTarget, isDraggingOver, isDraggingItem} = this.props
    // TODO: Uses mime type detection to determine if it is text or binary
    const editor = isDraggingOver
      ? <article style={style}>
          Drop to Open
        <code style={{fontSize: '150%'}}>{isDraggingItem && isDraggingItem.filepath}</code>
      </article>
      : filepath
        ? <article style={{overflow: 'hidden'}}><TextEditor filepath={filepath}/></article>
        : <article style={style}>{'No preview available for this filetype'}</article>
    return connectDropTarget(editor)
  }
}

const ItemTypes = {
  FILE: 'file',
  FOLDER: 'folder'
}

const fileTarget = {
  drop (props, monitor) {
    const item = monitor.getItem()
    // Handle drop-uploading of real files
    if (item.files) {
      for (let file of item.files) {
        const filename = '~temp' + path.extname(file.name)
        console.log('file =', file)
        var fileReader = new FileReader()
        fileReader.onload = async function () {
          try {
            await GitWorker.writeFile(filename, Buffer.from(this.result))
          } catch (err) {
            return console.log(err)
          }
          // Open file in Editor.
          EventHub.emit('openFile', filename)
        }
        fileReader.readAsArrayBuffer(file)
      }
      return
    }

    // Handle FileNavigatorFileComponent drops
    EventHub.emit('openFile', item.filepath)
  }
}

function targetCollect (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isDraggingOver: monitor.isOver(),
    isDraggingItem: monitor.getItem()
  }
}

const DropTargetFileEditor = DropTarget(
  [ItemTypes.FILE, NativeTypes.FILE],
  fileTarget,
  targetCollect
)(FileEditor)

export default DropTargetFileEditor
