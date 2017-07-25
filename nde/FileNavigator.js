import React from 'react'
import ReactDOM from 'react-dom'

import FileList from './FileTreeView/FileList.js'
import ApplicationFileComponent from './ApplicationFileComponent.js'
import ApplicationFolderComponent from './ApplicationFolderComponent.js'

import starterData from '../index.json'

const FileNavigator {
  render (
    <nav class="_tree">
      <FileList root={[]} data={starterData} FileComponent={ApplicationFileComponent} FolderComponent={ApplicationFolderComponent}/>
    </nav>
  )
}
export default FileNavigator
