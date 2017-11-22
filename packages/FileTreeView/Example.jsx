import React from 'react'
import _ from 'lodash'
import path from 'path'

import {FileList, File, Folder, AtomStyles} from 'react-file-browser'

const findDirectChildren = (filepath, filepaths) =>
  filepaths.filter(x => x.length > filepath.length)
    .filter(x => x.startsWith(filepath))
    .filter(x => x.lastIndexOf('/') <= filepath.length)
    .sort()

const BasicFolder = ({filename, open, ClickCallback, filepath}) => (
  <Folder filename={filename} open={open} domProps={{onClick: () => ClickCallback(filepath)}} />
)

class BasicFileTree extends React.Component {
  constructor (props) {
    super()
    let files = Object.keys(props.fileMap)
    let children = findDirectChildren(props.filepath, files) 
    this.state = {
      statedata: {},
      children
    }
  }
  toggle (fullpath) {
    this.setState((state, props) => {
      let val = _.get(state, ['statedata', fullpath, 'open'], false)
      _.set(state, ['statedata', fullpath, 'open'], !val)
      return state
    })
    data[fullpath].navOpen = !data[fullpath].navOpen
  }
  componentWillReceiveProps (newProps) {
    // compare newProps and this.props
    console.log(newProps.fileMap)
    let files = Object.keys(newProps.fileMap)
    let children = findDirectChildren(newProps.filepath, files)
    this.setState({ children })
  }
  render () {
    let toggle = this.toggle.bind(this)
    return (
      <nav className="_tree">
        <FileList
          root={[]}
          data={this.props.data}
          statedata={this.state.statedata}
          filepath={this.props.filepath}
          fileMap={this.props.fileMap}
          FileComponent={File}
          FolderComponent={BasicFolder}
          ClickCallback={toggle}
        />
      </nav>
    )
  }
}

const data = {
  '/': {
    type: 'dir'
  },
  '/home': {
    type: 'dir'
  },
  '/etc': {
    type: 'dir'
  },
  '/etc/config': {
    type: 'file'
  },
  '/initd': {
    type: 'file'
  },
  '/home/root': {
    type: 'dir'
  },
  '/home/root/.bashrc': {
    type: 'file'
  },
}

const ExampleTreeView = () =>
  <BasicFileTree fileMap={data} data={data} filepath={'/'} />


export default ExampleTreeView