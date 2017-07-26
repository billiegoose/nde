import React from 'react'
import Folder from './FileTreeView/Folder.js'

export default class FileNavigatorFolderComponent extends React.Component {
  click () {
    this.props.glEventHub.emit('toggleFolder', this.props.filepath)
  }
  render () {
    return (
      <Folder onClick={this.click.bind(this)} {...this.props}></Folder>
    )
  }
}