import React from 'react'
import ReactDOM from 'react-dom'
import fs from 'fs'
import path from 'path'

import {FileList} from 'react-file-browser'
import FileNavigatorFileComponent from './FileNavigatorFileComponent'
import FileNavigatorFolderComponent from './FileNavigatorFolderComponent'
import {Folder, FileIcon, FolderIcon} from 'react-file-browser'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import cuid from 'cuid'
import git from 'isomorphic-git'
import { prompt } from '../SweetAlert'
import swal from 'sweetalert2'
import ghparse from 'parse-github-url'

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
      } else {
        statDir(fullpath).then(result => {
          this.setState((state, props) => {
            _.merge(state, toDirStructure(fullpath, result))
            return state
          })
        }).catch(console.log)
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
  async newFile () {
    let filename = await prompt('Enter filename:')
    fs.writeFile(path.join(this.props.root, filename), '')
  }
  async newFolder () {
    fs.mkdir(path.join(this.props.root, await prompt('Enter foldername:')))
  }
  async deleteFolder () {
    fs.rmdir(this.props.root)
  }
  gitInit () {
    git(this.props.root).init()
  }
  async gitClone () {
    let url = await prompt({
      text: 'Github repo to clone',
      input: 'text',
      placeholder: 'user/repo',
      confirmButtonText: 'Clone Now'
    })
    let {branch, repo, name, owner} = ghparse(url)
    this.setFolderStateData('busy', true)
    let dir = path.join(this.props.root, name)
    this.props.glEventHub.emit('setFolderStateData', {fullpath: dir, key: 'busy', value: true})
    try {
      await git(dir)
        .depth(1)
        .branch(branch)
        .clone(`https://cors-buster-jfpactjnem.now.sh/github.com/${repo}`)
    } catch (err) {
      console.log('err =', err)
    } finally {
      this.props.glEventHub.emit('setFolderStateData', {fullpath: dir, key: 'busy', value: false})
      this.setFolderStateData('busy', false)
    }
  }
  async gitPush () {
    let token = await prompt({
      text: 'Github API token to use',
      input: 'password'
    })
    this.setFolderStateData('busy', true)
    try {
      await git(this.props.root)
        .githubToken(token)
        .remote('origin')
        .push('refs/heads/master')
    } catch (err) {
      console.log('err =', err)
    } finally {
      this.setFolderStateData('busy', false)
    }
  }
  render () {
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={this.state.disableContextMenu}>
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

        <ContextMenu id={this.state.cuid}>
          <SubMenu title="Git" hoverDelay={50}>
            <MenuItem onClick={() => this.gitInit()}>
              Init <Octicon name="repo"/>
            </MenuItem>
            <MenuItem onClick={() => this.gitClone()}>
              Clone <Octicon name="repo-clone"/>
            </MenuItem>
            <MenuItem disabled onClick={() => this.gitPush()}>
              Push <Octicon name="repo-push"/>
            </MenuItem>
          </SubMenu>
          <MenuItem onClick={() => this.newFile()}>
            New File <i className="icon text-icon"></i>
          </MenuItem>
          <MenuItem onClick={() => this.newFolder()}>
            New Folder <span style={{paddingTop: '3px', position: 'absolute', right: 0}}><FolderIcon></FolderIcon></span>
          </MenuItem>
          <MenuItem onClick={() => this.deleteFolder()}>
            Delete Folder <i className="icon trash-icon"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}
export default FileNavigator
