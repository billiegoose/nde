import React from 'react'
import FolderIcon from './FolderIcon.js'
import FileList from './FileList.js'

import './style.css'

class Folder extends React.Component {
  constructor () {
    super()
    this.state = {
      open: false
    }
  }
  toggle () {
    this.setState((state, props) => ({
      open: !state.open
    }))
  }
  render () {
    let {filename, ...props} = this.props
    let filelist = this.state.open ? <FileList {...props} /> : ''
    return (
      <li {...props}>
        <label>
          <a target="#" onClick={this.toggle.bind(this)}>
            <FolderIcon open={this.state.open}/>
            {filename}
          </a>
        </label>
        {filelist}
      </li>
    )
  }
}
export default Folder