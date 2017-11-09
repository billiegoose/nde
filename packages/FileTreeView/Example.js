import React from 'react'
import _ from 'lodash'

import {FileList, File, Folder, AtomStyles} from 'react-file-browser'

const BasicFolder = ({filename, open, ClickCallback, filepath}) => (
  <Folder filename={filename} open={open} domProps={{onClick:() => ClickCallback(filepath)}} />
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
      let val = _.get(state, ['statedata', fullpath, 'open'], false)
      _.set(state, ['statedata', fullpath, 'open'], !val)
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