import React from 'react'
import ReactDOM from 'react-dom'

import FileList from './FileTreeView/FileList.js'
import ApplicationFileComponent from './ApplicationFileComponent.js'
import ApplicationFolderComponent from './ApplicationFolderComponent.js'

import starterData from '../index.json'

class FileNavigator extends React.Component {
  componentDidMount () {
    this.props.glContainer.setTitle('File Navigator')
  }
  render () {
    return (
      <nav className="_tree">
        <FileList root={[]} data={starterData} FileComponent={ApplicationFileComponent} FolderComponent={ApplicationFolderComponent} {...this.props}/>
      </nav>
    )
  }
}
export default FileNavigator
