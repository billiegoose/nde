import React from 'react'
import Folder from './FileTreeView/Folder.js'

export default class ApplicationFolderComponent extends React.Component {
  click () {
    this.props.glEventHub.emit('folderClick', this.props.filename)
  }
  render () {
    return (
      <Folder onClick={this.click.bind(this)} {...this.props}></Folder>
    )
  }
}