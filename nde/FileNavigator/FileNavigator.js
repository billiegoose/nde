import React from 'react'
import ReactDOM from 'react-dom'
import fs from 'fs'
import path from 'path'

import {FileList} from 'react-file-browser'
import FileNavigatorFileComponent from './FileNavigatorFileComponent'
import FileNavigatorFolderComponent from './FileNavigatorFolderComponent'
import {Folder, FileIcon, FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import ContextMenuFolder from './ContextMenuFolder'
// Drag and drop support
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'

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

function toDirStructure (fullpath, result) {
  let tmp = {}
  _.set(tmp, ['data', ...fullpath.split('/').filter(x => x !== '')], result)
  return tmp
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
    // const fn = `MotherLayout.eventHub.emit('DISABLE_CONTEXTMENU')`
    // let button = $(`<li title="disable right-click menu"><input type="checkbox" onclick="${fn}"></li>`)
    // this.props.glContainer.parent.container.tab.header.controlsContainer.prepend(button)

    this.props.glEventHub.on('toggleFolder', this.toggleFolder.bind(this))
    this.props.glEventHub.on('refreshGitStatus', this.refreshDir.bind(this))
    this.props.glEventHub.on('setFolderStateData', this.setFolderStateData.bind(this))
    this.props.glEventHub.on('DISABLE_CONTEXTMENU', () => {
      this.setState((state, props) => ({
        state,
        disableContextMenu: !state.disableContextMenu
      }))
    })
    this.refreshDir('/')
    fs.Events.on('change', ({eventType, filename}) => this.refreshDir(filename))
  }
  refreshDir (fullpath) {
    isFile(fullpath)
    .then(is_file => {
      // File deleted case
      if (is_file === null) {
        this.setState((state, props) => {
          _.unset(state, ['data', ...fullpath.split('/').filter(x => x !== '')])
          return state
        })
      } else if (is_file === true) {
        this.setState((state, props) => {
          _.merge(state, toDirStructure(fullpath, null))
          return state
        })
        git().findRoot(fullpath).then(dir =>
          git(dir).status(path.relative(dir, fullpath)).then(status =>
            this.props.glEventHub.emit('setFolderStateData', {fullpath: fullpath, key: 'gitstatus', value: status})
          )
        ).catch(() => null)
      } else {
        statDir(fullpath).then(result => {
          this.setState((state, props) => {
            _.merge(state, toDirStructure(fullpath, result))
            return state
          })
        }).catch(console.log)
        git().findRoot(fullpath).then(dir => {
          console.log('dir =', dir)
          // This is stupid. Stupid stupid data structure choices.
          fs.readdir(fullpath, (err, files) => {
            for (let file of files) {
              console.log('file =', file)
              let rpath = path.relative(dir, path.join(fullpath, file))
              console.log('rpath =', rpath)
              git(dir).status(rpath).then(status =>
                this.props.glEventHub.emit('setFolderStateData', {fullpath: path.join(fullpath, file), key: 'gitstatus', value: status})
              ).catch(() => null)
            }
          })
        }).catch(() => null)
      }
    }).catch(console.log)
  }
  toggleFolder (fullpath) {
    this.setState((state, props) => {
      let wasOpen = _.get(state, ['statedata', fullpath, 'open'], false)
      let nowOpen = !wasOpen
      _.set(state, ['statedata', fullpath, 'open'], nowOpen)
      if (nowOpen) {
        this.refreshDir(fullpath)
      }
      return state
    })
  }
  setFolderStateData ({fullpath, key, value}) {
    this.setState((state, props) => {
      _.set(state, ['statedata', fullpath, key], value)
      return state
    })
  }
  render () {
    return (
      <ContextMenuFolder filepath={this.props.root} disableContextMenu={this.props.disableContextMenu} glEventHub={this.props.glEventHub}>
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
      </ContextMenuFolder>
    )
  }
}
export default DragDropContext(HTML5Backend)(FileNavigator)
