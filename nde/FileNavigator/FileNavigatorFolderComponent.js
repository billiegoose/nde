import React from 'react'
import {Folder, FileIcon, FolderIcon} from 'react-file-browser'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import git from 'isomorphic-git'
import { prompt } from '../SweetAlert'
import swal from 'sweetalert2'

export default class FileNavigatorFolderComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid(),
    }
  }
  click () {
    this.props.glEventHub.emit('toggleFolder', this.props.filepath)
  }
  setFolderStateData (key, value) {
    this.props.glEventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})
  }
  async newFile () {
    let filename = await prompt('Enter filename:')
    fs.writeFile(path.join(this.props.filepath, filename))
  }
  async newFolder () {
    fs.mkdir(path.join(this.props.filepath, await prompt('Enter foldername:')))
  }
  gitInit () {
    git(this.props.filepath).init()
  }
  async gitClone () {
    let steps = [
      {
        text: 'Github API token to use',
        input: 'password',
        confirmButtonText: 'Next &rarr;',
        progressSteps: ['1', '2']
      },{
        text: 'Github repo to clone',
        input: 'text',
        placeholder: 'user/repo',
        confirmButtonText: 'Clone Now',
        progressSteps: ['1', '2']
      }
    ]
    try {
        let result = await swal.queue(steps)
        let token = result[0]
        let url = result[1]
        this.setFolderStateData('busy', true)
        await git(this.props.filepath)
            .githubToken(token)
            .depth(1)
            .clone(`https://cors-buster-jfpactjnem.now.sh/github.com/${url}`)
        
    } catch (err) {
        console.log(err)
    } finally {
        swal.resetDefaults()
        this.setFolderStateData('busy', false)
    }
  }
  render() {
    let {disableContextMenu, filename, open, ...passedProps} = this.props
    let busyIcon = passedProps.statedata && passedProps.statedata.busy
             ? <span>&nbsp;<i className='fa fa-spinner fa-spin'></i></span>
             : ''
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        <Folder filename={filename} open={open} domProps={{onClick:this.click.bind(this)}}>
          {busyIcon}
        </Folder>

        <ContextMenu id={this.state.cuid}>
          <SubMenu title="Git" hoverDelay={50}>
            <MenuItem onClick={() => this.gitInit()}>
              Init <FileIcon filename=".git"></FileIcon>
            </MenuItem>
            <MenuItem onClick={() => this.gitClone()}>
              Clone <FileIcon filename=".git"></FileIcon>
            </MenuItem>
          </SubMenu>

          <MenuItem onClick={() => this.newFile()}>
            New File <i className="icon text-icon"></i>
          </MenuItem>
          <MenuItem onClick={() => this.newFolder()}>
            New Folder <FolderIcon></FolderIcon>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}