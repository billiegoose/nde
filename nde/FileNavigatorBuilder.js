import React from 'react'
import ReactDOM from 'react-dom'

// Compose the FileNavigator component out of its constituent View and Behavior pieces
import {FileTreeViewBuilder, FileComponent, FolderComponent} from './FileTreeView/index.js'
import DragSourceWrapperBuilder from './DragSourceWrapperBuilder.js'
import DoubleClickWrapperBuilder from './DoubleClickWrapperBuilder.js'

const FileNavigatorBuilder = (MotherLayout) => {
  const ApplicationFileComponent = DoubleClickWrapperBuilder({
    goldenLayoutInstance: MotherLayout,
    Component: DragSourceWrapperBuilder({
      goldenLayoutInstance: MotherLayout,
      Component: FileComponent
    })
  })
  return FileTreeViewBuilder(FolderComponent, ApplicationFileComponent);
}
export default FileNavigatorBuilder
