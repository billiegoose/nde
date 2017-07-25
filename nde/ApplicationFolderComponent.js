import react from 'react'
import Folder from './FileTreeView/Folder.js'

export default class ApplicationFolderComponent extends React.Component {
  render () {
    return (
      <Folder {...this.props}></Folder>
    )
  }
}