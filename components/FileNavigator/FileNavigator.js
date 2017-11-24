import React from 'react'
import ReactDOM from 'react-dom'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import {FileList, Folder, FileIcon, FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import FileNavigatorFileComponent from './FileNavigatorFileComponent'
import FileNavigatorFolderComponent from './FileNavigatorFolderComponent'
import ContextMenuFolder from './ContextMenuFolder'

// returns true if file, false if directory, null if error (e.g. not found)
const isFile = async (fullpath) => {
  return new Promise(function (resolve, reject) {
    fs.stat(fullpath, (err, stats) => {
      if (err) return resolve(null)
      console.log('fullpath, stats.isFile() =', fullpath, stats.isFile())
      return resolve(stats.isFile())
    })
  })
}

class FileNavigator extends React.Component {
  constructor () {
    super()
    this.state = {
      statedata: {},
      disableContextMenu: false
    }
  }
  componentDidMount () {
    if (this.props.glContainer) {
      this.props.glContainer.setTitle('File Navigator')
    }
    EventHub.on('toggleFolder', this.toggleFolder.bind(this))
    EventHub.on('refreshGitStatus', this.refreshDir.bind(this))
    EventHub.on('setFolderStateData', this.setFolderStateData.bind(this))
    EventHub.on('DISABLE_CONTEXTMENU', () => {
      this.setState((state, props) => ({
        state,
        disableContextMenu: !state.disableContextMenu
      }))
    })
    this.refreshDir('/')
    fs.Events.on('change', ({eventType, filename}) => this.refreshDir(filename))
  }
  statDir (dirpath) {
    fs.readdir(dirpath, (err, files) => {
      if (err) return reject(err)
      files.forEach(async filename => {
        let filepath = path.join(dirpath, filename)
        let type = await isFile(filepath) ? 'file' : 'dir'
        this.setState((state) => {
          _.set(state, ['statedata', filepath, 'type'], type)
          return state
        })
      })
    })
  }
  async refreshDir (fullpath) {
    let is_file = await isFile(fullpath)
    // File deleted case
    if (is_file === null) {
      this.setState((state, props) => {
        _.unset(state, ['statedata', fullpath])
        return state
      })
    } else if (is_file === true) {
      this.setState((state, props) => {
        _.merge(state, ['statedata', fullpath], {type: 'file'})
        return state
      })
      let dir = await git().findRoot(fullpath)
      let status = await git(dir).status(path.relative(dir, fullpath))
      EventHub.emit('setFolderStateData', {fullpath: fullpath, key: 'gitstatus', value: status})
    } else {
      this.statDir(fullpath)
      let dir = await git().findRoot(fullpath)
      console.log('dir =', dir)
      // This is stupid. Stupid stupid data structure choices.
      fs.readdir(fullpath, async (err, files) => {
        for (let file of files) {
          let filepath = path.join(fullpath, file)
          if (await isFile(filepath)) {
            console.log('file =', file)
            let rpath = path.relative(dir, filepath)
            console.log('rpath =', rpath)
            git(dir).status(rpath).then(status =>
              EventHub.emit('setFolderStateData', {fullpath: filepath, key: 'gitstatus', value: status})
            ).catch((err) => console.log(err, dir, file, rpath))
          }
        }
      })
    }
  }
  toggleFolder (fullpath) {
    this.setState((state, props) => {
      let wasOpen = _.get(state, ['statedata', fullpath, 'navOpen'], false)
      let nowOpen = !wasOpen
      _.set(state, ['statedata', fullpath, 'navOpen'], nowOpen)
      if (nowOpen) {
        this.refreshDir(fullpath)
      }
      return state
    })
  }
  setFolderStateData ({fullpath, key, value}) {
    console.log('setFolderStateData', fullpath, key, value)
    this.setState((state, props) => {
      _.set(state, ['statedata', fullpath, key], value)
      return state
    })
  }
  render () {
    return (
      <ContextMenuFolder filepath={this.props.root} disableContextMenu={this.props.disableContextMenu}>
        <nav className="_tree">
          <FileList
            disableContextMenu={this.state.disableContextMenu}
            root={[]}
            statedata={this.state.statedata}
            filepath="/"
            fileMap={this.state.statedata}
            FileComponent={FileNavigatorFileComponent}
            FolderComponent={FileNavigatorFolderComponent}
            {...this.props}
          />
        </nav>
      </ContextMenuFolder>
    )
  }
}
export default FileNavigator
