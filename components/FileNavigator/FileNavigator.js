/* global EventHub */
import React from 'react'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import git from 'isomorphic-git'
import {FileList} from 'react-file-browser'
import pify from 'pify'
import FileNavigatorFileComponent from './FileNavigatorFileComponent'
import FileNavigatorFolderComponent from './FileNavigatorFolderComponent'
import ContextMenuFileNavigator from './ContextMenuFileNavigator'

// returns true if file, false if directory, null if error (e.g. not found)
const isFile = async (fullpath) => {
  return new Promise(function (resolve, reject) {
    fs.stat(fullpath, (err, stats) => {
      if (err) return resolve(null)
      return resolve(stats.isFile())
    })
  })
}

class FileNavigator extends React.Component {
  constructor () {
    super()
    this.state = {
      fileMap: {
        '/' : {
          type: 'dir',
          navOpen: true
        }
      },
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
    fs.Events.on('change', ({eventType, filename}) => this.refreshDir(filename))
    // this.crawlDirectory('/')
    this.pureCrawlDirectory('/').then(fileMap => 
      this.setState((state, props) => ({fileMap}))
    )
  }
  async pureCrawlDirectory (filepath, depth = 5) {
    if (depth === 0) return {}
    console.time(filepath)
    let files
    try {
      files = await pify(fs.readdir)(filepath)
    } catch (err) {
      // Yes, regretably this is the *fastest* way to find out if a filepath is a file, or a directory and read it.
      if (err.code === 'ENOTDIR') {
        console.timeEnd(filepath)
        return {[filepath]: {type: 'file'}}
      } else {
        throw err
      }
    }
    // Don't recurse into directories ending in .git
    if (filepath.endsWith('.git')) return {[filepath]: {type: 'dir'}}
    // else
    return new Promise((resolve, reject) => {
      requestIdleCallback(async (deadline) => {
        let result = await Promise.all(files.map(name => this.pureCrawlDirectory(path.join(filepath, name), depth - 1)))
        console.timeEnd(filepath)
        resolve(Object.assign({[filepath]: {type: 'dir'}}, ...result))
      })
    })
  }
  async crawlDirectory (filepath, depth = 3) {
    if (filepath.endsWith('.git')) return []
    if (depth === 0) return []
    console.time(filepath)
    let files
    try {
      files = await pify(fs.readdir)(filepath)
    } catch (err) {
      // Yes, regretably this is the *fastest* way to find out if a filepath is a file, or a directory and read it.
      if (err.code === 'ENOTDIR') {
        this.setState(state => {
          _.set(state, ['fileMap', filepath, 'type'], 'file')
          return state
        })
        console.timeEnd(filepath)
        return []
      } else {
        throw err
      }
    }
    this.setState(state => {
      _.set(state, ['fileMap', filepath, 'type'], 'dir')
      return state
    })
    return new Promise((resolve, reject) => {
      requestIdleCallback(async (deadline) => {
        let result = await Promise.all(files.map(name => this.crawlDirectory(path.join(filepath, name), depth - 1)))
        console.timeEnd(filepath)
        resolve(result)
      })
    })
  }
  async refreshDir (fullpath) {
    console.time(fullpath + ' isFile')
    let isfile = await isFile(fullpath)
    console.timeEnd(fullpath + ' isFile')
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
        let gitdir = await git().findRoot(fullpath)
        let status = await git(gitdir).status(path.relative(gitdir, fullpath))
        EventHub.emit('setFolderStateData', {fullpath: fullpath, key: 'gitstatus', value: status})
      } catch (err) {
        console.log('not in a git repo', fullpath)
      }
    } else {
      this.setState((state, props) => {
        _.merge(state, ['fileMap', fullpath], {type: 'dir'})
        return state
      })
      // For folders that are open...
      if (this.state.fileMap[fullpath] && this.state.fileMap[fullpath].navOpen) {
        let gitdir = null
        // Find the parent git root dir if there is one
        try {
          // Don't try to get the git status of anything *inside* a .git dir
          if (path.basename(fullpath) !== '.git') {
            gitdir = await git().findRoot(fullpath)
          }
        } catch (err) {
          console.log('not tracked by git')
        }
        console.time(fullpath + ' readdir')
        fs.readdir(fullpath, async (err, files) => {
          console.timeEnd(fullpath + ' readdir')
          for (let file of files) {
            let filepath = path.join(fullpath, file)
            let type = await isFile(filepath) ? 'file' : 'dir'
            // Determine whether the child is a file or a dir
            this.setState((state) => {
              _.set(state, ['fileMap', filepath, 'type'], type)
              return state
            })
            // If it's a file, check the git status
            if (type === 'file' && gitdir !== null) {
              let rpath = path.relative(gitdir, filepath)
              console.time(rpath + ' gitstatus')
              git(gitdir).status(rpath).then(status => {
                console.timeEnd(rpath + ' gitstatus')
                EventHub.emit('setFolderStateData', {fullpath: filepath, key: 'gitstatus', value: status})
              }).catch((err) => console.log(err, gitdir, file, rpath))
            }
          }
        })
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
      console.timeEnd(fullpath)
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
      <ContextMenuFileNavigator filepath={this.props.root} disableContextMenu={this.props.disableContextMenu}>
        <nav className="_tree">
          <FileList
            disableContextMenu={this.state.disableContextMenu}
            filepath="/"
            open={true}
            fileMap={this.state.fileMap}
            FileComponent={FileNavigatorFileComponent}
            FolderComponent={FileNavigatorFolderComponent}
            {...this.props}
          />
        </nav>
      </ContextMenuFileNavigator>
    )
  }
}
export default FileNavigator
