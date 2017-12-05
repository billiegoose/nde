import React from 'react'
import {FileList, File, Folder} from 'react-file-browser'

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

const BasicFolder = ({filename, open, toggle, filepath}) => (
  <Folder filename={filename} open={open} domProps={{onClick: () => toggle(filepath)}}>
    {filename}
  </Folder>
)

const BasicFile = ({filename, open, toggle, filepath}) => (
  <File filename={filename} open={open} domProps={{onClick: () => toggle(filepath)}}>
    {filename}
  </File>
)

class BasicFileTree extends React.Component {
  constructor ({initData}) {
    super()
    this.state = initData
  }
  toggle (fullpath) {
    let node = Object.assign({}, this.state[fullpath])
    node.navOpen = !node.navOpen
    this.setState({[fullpath]: node})
  }
  render () {
    const toggle = this.toggle.bind(this)
    return (
      <nav className="_tree">
        <FileList
          filepath="/"
          fileMap={this.state}
          open={true}
          FileComponent={BasicFile}
          FolderComponent={BasicFolder}
          toggle={toggle}
        />
      </nav>
    )
  }
}

const ExampleTreeView = () =>
  <BasicFileTree initData={data} />

export default ExampleTreeView