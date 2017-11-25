/* global EventHub */
import React from 'react'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import git from 'isomorphic-git'
import {FileList} from 'react-file-browser'

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
      fileMap: {},
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
      if (err) return console.log(err)
      files.forEach(async filename => {
        let filepath = path.join(dirpath, filename)
        let type = await isFile(filepath) ? 'file' : 'dir'
        this.setState((state) => {
          _.set(state, ['fileMap', filepath, 'type'], type)
          return state
        })
      })
    })
  }
  async refreshDir (fullpath) {
    let isfile = await isFile(fullpath)
    // File deleted case
    if (isfile === null) {
      this.setState((state, props) => {
        _.unset(state, ['fileMap', fullpath])
        return state
      })
    } else if (isfile === true) {
      this.setState((state, props) => {
        _.merge(state, ['fileMap', fullpath], {type: 'file'})
        return state
      })
      try {
        let dir = await git().findRoot(fullpath)
        let status = await git(dir).status(path.relative(dir, fullpath))
        EventHub.emit('setFolderStateData', {fullpath: fullpath, key: 'gitstatus', value: status})
      } catch (err) {
        console.log('not in a git repo', fullpath)
      }
    } else {
      this.statDir(fullpath)
      // Don't try to get the git status of anything *inside* a .git dir
      if (path.basename(fullpath) == '.git') return
      try {
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
      } catch (err) {
        console.log('not in a git repo', fullpath)
      }
    }
  }
  toggleFolder (fullpath) {
    this.setState((state, props) => {
      let wasOpen = _.get(state, ['fileMap', fullpath, 'navOpen'], false)
      let nowOpen = !wasOpen
      _.set(state, ['fileMap', fullpath, 'navOpen'], nowOpen)
      if (nowOpen) {
        this.refreshDir(fullpath)
      }
      return state
    })
  }
  setFolderStateData ({fullpath, key, value}) {
    console.log('setFolderStateData', fullpath, key, value)
    this.setState((state, props) => {
      _.set(state, ['fileMap', fullpath, key], value)
      return state
    })
  }
  render () {
    return (
      <ContextMenuFolder filepath={this.props.root} disableContextMenu={this.props.disableContextMenu}>
        <nav className="_tree">
          <FileList
            disableContextMenu={this.state.disableContextMenu}
            filepath="/"
            fileMap={this.state.fileMap}
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
