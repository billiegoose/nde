import React from 'react'
import FileList from './FileList'
import File from './File'
import Folder from './Folder'
// Import component styles
import './style.css'


const BasicFolder = ({filename, open, ClickCallback, filepath}) => (
  <Folder filename={filename} open={open} onClick={() => ClickCallback(filepath)} />
)

class BasicFileTree extends React.Component {
  constructor () {
    super()
    this.state = {
      statedata: {}
    }
  }
  toggle (fullpath) {
    this.setState((state, props) => {
      if (!state.statedata[fullpath]) {
        state.statedata[fullpath] = {
          open: false
        }
      }
      state.statedata[fullpath].open = !state.statedata[fullpath].open
      return state
    })
  }
  
  render () {
    let toggle = this.toggle.bind(this)
    return (
      <nav className="_tree">
        <FileList
          root={[]}
          data={this.props.data}
          statedata={this.state.statedata}
          FileComponent={File}
          FolderComponent={BasicFolder}
          ClickCallback={toggle}
        />
      </nav>
    )
  }
}
export default BasicFileTree