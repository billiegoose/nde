import React from 'react'
import ReactDOM from 'react-dom'
import fs from 'fs'
import path from 'path'

import FileList from './FileTreeView/FileList.js'
import FileNavigatorFileComponent from './FileNavigatorFileComponent.js'
import FileNavigatorFolderComponent from './FileNavigatorFolderComponent.js'

import starterData from '../../index.json'

import _ from 'lodash'

// returns true if file, false if directory, null if error (e.g. not found)
const isFile = async (fullpath) => {
  return new Promise(function(resolve, reject) {
    fs.stat(fullpath, (err, stats) => {
      if (err) return resolve(null);
      console.log('fullpath, stats.isFile() =', fullpath, stats.isFile())
      return resolve(stats.isFile())
    })
  })
}

const separateFilesFromFolders = async (root, files) => {
  files = await Promise.all(files.map(async file => {
    let isfile = await isFile(path.join(root, file))
    if (isfile === null) return null
    return ({
      fullpath: path.join(root, file),
      filename: file,
      isFile: isfile ? 1 : 0
    })
  }))
  files = files.filter(file => file !== null)
  console.log('files =', files)
  files = _.sortBy(files, ['isFile', 'filename'])
  let result = {}
  for (let f of files) {
    result[f.filename] = f.isFile ? null : {}
  }
  return result
}

async function statDir (fullpath) {
  return new Promise(function(resolve, reject) {
    fs.readdir(fullpath, async (err, files) => {
      if (err) return reject(err);
      console.log('files =', files)
      let result = await separateFilesFromFolders(fullpath, files)
      console.log('result =', result)
      resolve(result)
    })
  })
}

class FileNavigator extends React.Component {
  constructor () {
    super()
    this.state = {
      data: {},
      statedata: {},
      disableContextMenu: false,
    }
  }
  componentDidMount () {
    this.props.glContainer.setTitle('File Navigator')
    const fn = `MotherLayout.eventHub.emit('DISABLE_CONTEXTMENU')`
    let button = $(`<li title="disable right-click menu"><input type="checkbox" onclick="${fn}"></li>`)
    this.props.glContainer.parent.container.tab.header.controlsContainer.prepend(button)

    this.props.glEventHub.on('toggleFolder', this.toggleFolder.bind(this))
    this.props.glEventHub.on('DISABLE_CONTEXTMENU', () => {
      this.setState((state, props) => ({
        state,
        disableContextMenu: !state.disableContextMenu
      }))
    })
    // TODO: Combine this call with the statDir call below so they share code for a general solution
    statDir('/').then(result => {
      console.log('result =', result)
      this.setState((state, props) => {
        let foo = {}
        _.set(foo, ['data'], result)
        _.merge(state, foo)
        return state
      })
    })
  }
  toggleFolder (fullpath) {
    this.setState((state, props) => {
      let wasOpen = _.get(state, ['statedata', fullpath, 'open'], false)
      let nowOpen = !wasOpen
      _.set(state, ['statedata', fullpath, 'open'], nowOpen)
      if (nowOpen) {
        statDir(fullpath).then(result => {
          console.log('result =', result)
          this.setState((state, props) => {
            let foo = {}
            _.set(foo, ['data', ...fullpath.split('/')], result)
            _.merge(state, foo)
            return state
          })
        })
      }
      return state
    })
  }
  render () {
    return (
      <nav className="_tree">
        <FileList
          disableContextMenu={this.state.disableContextMenu}
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
