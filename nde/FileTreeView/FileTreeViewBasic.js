import React from 'react'
import FileList from './FileList'
import File from './File'
import Folder from './Folder'
// Import component styles
import './style.css'
class BasicFileTree extends React.Component {
  render () {
    return (
      <nav className="_tree">
        <FileList root={[]} data={this.props.data} FileComponent={File} FolderComponent={Folder}/>
      </nav>
    )
  }
}
export default BasicFileTree