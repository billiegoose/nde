import React from 'react'
import ReactDOM from 'react-dom'

import FileList from './FileTreeView/FileList.js'
import FileNavigatorFileComponent from './FileNavigatorFileComponent.js'
import FileNavigatorFolderComponent from './FileNavigatorFolderComponent.js'

import starterData from '../../index.json'

import _ from 'lodash'

class FileNavigator extends React.Component {
  constructor () {
    super()
    this.state = {
      data: starterData,
      statedata: {}
    }
  }
  componentDidMount () {
    this.props.glEventHub.on('toggleFolder', this.toggleFolder.bind(this))
    this.props.glContainer.setTitle('File Navigator')
  }
  toggleFolder (fullpath) {
    this.setState((state, props) => {
      let currentValue = _.get(state, ['statedata', fullpath, 'open'], false)
      _.set(state, ['statedata', fullpath, 'open'], !currentValue)
      return state
    })
  }
  render () {
    return (
      <nav className="_tree">
        <FileList
          root={[]}
          data={this.state.data}
          statedata={this.state.statedata}
          FileComponent={FileNavigatorFileComponent}
          FolderComponent={FileNavigatorFolderComponent}
          {...this.props}
        />
      </nav>
    )
  }
}
export default FileNavigator
