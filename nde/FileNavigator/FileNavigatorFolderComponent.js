import React from 'react'
import Folder from './FileTreeView/Folder.js'
import FileIcon from './FileTreeView/FileIcon.js'
import FolderIcon from './FileTreeView/FolderIcon.js'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import git from 'esgit'

export default class FileNavigatorFolderComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid()
    }
  }
  click () {
    this.props.glEventHub.emit('toggleFolder', this.props.filepath)
  }
  newFile () {
    fs.writeFile(path.join(this.props.filepath, 'NewFile.txt'))
  }
  newFolder () {
    fs.mkdir(path.join(this.props.filepath, 'NewFolder'))
  }
  gitInit () {
    git(this.props.filepath).init()
  }
  render() {
    return (
      <ContextMenuTrigger id={this.state.cuid}>
        <Folder onClick={this.click.bind(this)} {...this.props}></Folder>

        <ContextMenu
          id={this.state.cuid}
        >
          <SubMenu title="Git" hoverDelay={50}>
            <MenuItem onClick={() => this.gitInit()}>
              Init <span style={{ right: 0, position: 'absolute' }}><FileIcon filename=".git"></FileIcon></span>
            </MenuItem>
          </SubMenu>

          <MenuItem onClick={() => this.newFile()}>
            New File <span style={{ right: 0, position: 'absolute' }}><i className="icon text-icon"></i></span>
          </MenuItem>
          <MenuItem onClick={() => this.newFolder()}>
            New Folder <span style={{ right: 0, position: 'absolute' }}><FolderIcon></FolderIcon></span>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}