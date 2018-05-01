/* global EventHub */
import React from 'react'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import {findRoot, status as gitStatus} from 'isomorphic-git'
import {FileList} from 'react-file-browser'
import pify from 'pify'
import FileNavigatorFileComponent from './FileNavigatorFileComponent'
import FileNavigatorFolderComponent from './FileNavigatorFolderComponent'
import ContextMenuFileNavigator from './ContextMenuFileNavigator'
import { GitWorker } from 'isomorphic-git-worker'

// returns true if file, false if directory, null if error (e.g. not found)
const isFile = async (fullpath) => {
  const FileType = {
    FILE: 0x8000,
    DIRECTORY: 0x4000,
    SYMLINK: 0xA000
  }
  try {
    let stat = await GitWorker.stat(fullpath)
    return (stat.mode & 0xF000) === FileType.FILE;
  } catch (err) {
    return true
  }
}

class FileNavigator extends React.Component {
  onWrite = async ({filepath}) => {
    this.setState((state, props) => {
      _.merge(state, ['fileMap', filepath], {type: 'file'})
      return state
    })
    this.refreshFile(filepath)
  }
  onUnlink = ({filepath}) => {
    this.setState((state, props) => {
      _.unset(state, ['fileMap', filepath])
      return state
    })
  }
  onMkdir = ({filepath}) => {
    this.setState((state, props) => {
      _.merge(state, ['fileMap', filepath], {type: 'dir'})
      return state
    })
  }
  onRmdir = ({filepath}) => {
    this.setState((state, props) => {
      _.unset(state, ['fileMap', filepath])
      return state
    })
  }
  onRename = async ({from, to}) => {
    this.setState((state, props) => {
      state.fileMap[to] = state.fileMap[from]
      _.unset(state, ['fileMap', from])
      return state
    })
    this.refreshDir(from)
    this.refreshDir(to)
  }
  toggleFolder = (fullpath) => {
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
  setFolderStateData = ({fullpath, key, value}) => {
    console.log('setFolderStateData', fullpath, key, value)
    this.setState((state, props) => {
      _.set(state, ['fileMap', fullpath, key], value)
      return state
    })
  }
  refresh = async (filepath) => {
    if (state.fileMap[filepath] && state.fileMap[filepath].type) {
      if (state.fileMap[filepath].type === 'file') {
        return this.refreshFile(filepath)
      } else if (state.fileMap[filepath].type === 'dir') {
        return this.refreshDir(filepath)
      }
    } else {
      let isfile = await isFile(filepath)
      if (isfile === true) {
        return this.refreshFile(filepath)
      } else if (isfile === false) {
        return this.refreshDir(filepath)
      }
    }
  }
  refreshFile = async (filepath) => {
    try {
      let dir = await findRoot({fs, filepath})
      let status = await gitStatus({fs, dir, filepath: path.relative(dir, filepath)})
      EventHub.emit('setFolderStateData', {fullpath: filepath, key: 'gitstatus', value: status})
    } catch (err) {
      // console.log('not in a git repo', filepath)
    }
  }
  refreshDir = async (fullpath) => {
    await this.refreshFile(fullpath)
    // For folders that are open...
    if (this.state.fileMap[fullpath] && this.state.fileMap[fullpath].navOpen) {
      let gitdir = null
      // Find the parent git root dir if there is one
      try {
        // Don't try to get the git status of anything *inside* a .git dir
        if (path.basename(fullpath) !== '.git') {
          gitdir = await findRoot({fs, filepath: fullpath})
        }
      } catch (err) {
        console.log('not tracked by git')
      }
      console.time(fullpath + ' readdir')
      let files
      try {
        files = await GitWorker.readdir(fullpath)
      } catch (err) {
        // Yes, regretably this is the *fastest* way to find out if a filepath is a file, or a directory and read it.
        if (err.code === 'ENOTDIR') {
          console.timeEnd(fullpath + ' readdir')
          return
        } else {
          throw err
        }
      }
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
          gitStatus({fs, dir: gitdir, filepath: rpath}).then(status => {
            console.timeEnd(rpath + ' gitstatus')
            EventHub.emit('setFolderStateData', {fullpath: filepath, key: 'gitstatus', value: status})
          }).catch((err) => console.log(err, gitdir, file, rpath))
        }
      }
    }
  }
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
    EventHub.on('toggleFolder', this.toggleFolder)
    EventHub.on('setFolderStateData', this.setFolderStateData)
    EventHub.on('refreshGitStatus', this.refresh)
    EventHub.on('refreshGitStatusFile', this.refreshFile)
    EventHub.on('refreshGitStatusDir', this.refreshDir)

    EventHub.on('renameFile', ({from, to}) => {
      return pify(fs.rename)(from, to)
    })
    EventHub.on('DISABLE_CONTEXTMENU', () => {
      this.setState((state, props) => ({
        state,
        disableContextMenu: !state.disableContextMenu
      }))
    })
    fs.Events.on('unlink', this.onUnlink)
    fs.Events.on('write', this.onWrite)
    fs.Events.on('mkdir', this.onMkdir)
    fs.Events.on('rmdir', this.onRmdir)
    fs.Events.on('rename', this.onRename)
    fs.Events.on('change', ({eventType, filename}) => this.refreshDir(filename))
    // this.crawlDirectory('/')
    this.pureCrawlDirectory('/').then(fileMap => 
      this.setState((state, props) => ({fileMap}))
    )
  }
  componentWillUnmount () {
    EventHub.off('toggleFolder', this.toggleFolder)
    EventHub.off('setFolderStateData', this.setFolderStateData)
    EventHub.off('refreshGitStatus', this.refresh)
    EventHub.off('refreshGitStatusFile', this.refreshFile)
    EventHub.off('refreshGitStatusDir', this.refreshDir)
    fs.Events.off('unlink', this.onUnlink)
    fs.Events.off('write', this.onWrite)
    fs.Events.on('mkdir', this.onMkdir)
    fs.Events.on('rmdir', this.onRmdir)
    fs.Events.off('rename', this.onRename)
  }
  async pureCrawlDirectory (filepath, depth = 5) {
    if (depth === 0) return {}
    console.time(filepath)
    let files
    try {
      files = await GitWorker.readdir(filepath)
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
      files = await GitWorker.readdir(filepath)
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
