import React from 'react'
import {File, FileIcon} from 'react-file-browser'
import StatusIcon from './StatusIcon'
import Octicon from 'react-octicons-modular'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import fs from 'fs'
import path from 'path'
import cuid from 'cuid'

export default class FileNavigatorFileComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid(),
    }
  }
  componentDidMount () {
    if (this.props.glContainer) {
      this.props.glContainer.layoutManager.createDragSource(ReactDOM.findDOMNode(this), {
        type:'react-component',
        component: 'EditableTextFile',
        props: { filepath: this.props.filepath }
      })
    }
  }
  doubleclick () {
    if (this.props.glContainer) {
      let stack = this.props.glContainer.layoutManager.root.getItemsById('MainEditor')[0]
      stack.addChild({
        type:'react-component',
        component: 'EditableTextFile',
        props: { filepath: this.props.filepath }
      })
    }
    MotherLayout.eventHub.emit('openFile', this.props.filepath)
  }
  deleteFile () {
    fs.unlink(this.props.filepath)
  }
  async copyFile () {
    let name = await prompt('Copy file as')
    let newfile = path.resolve(path.dirname(this.props.filepath), name)
    fs.readFile(this.props.filepath, (err, buf) =>
      fs.writeFile(newfile, buf, () =>
        MotherLayout.eventHub.emit('refreshGitStatus', newfile)
      )
    )
  }
  async addToIndex () {
    let dir = await git().findRoot(this.props.filepath)
    let rpath = path.relative(dir, this.props.filepath)
    await git(dir).add(rpath)
    MotherLayout.eventHub.emit('refreshGitStatus', this.props.filepath)
  }
  render () {
    let {disableContextMenu, filename} = this.props
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        <File filename={filename} domProps={{onDoubleClick: this.doubleclick.bind(this)}}>
          &nbsp;<StatusIcon status={this.props.statedata && this.props.statedata.gitstatus || 'unmodified'} />
        </File>

        <ContextMenu id={this.state.cuid}>
          <MenuItem onClick={() => this.addToIndex()}>
            Add to Stage <i className="icon git-icon medium-red"></i>
          </MenuItem>
          <MenuItem onClick={() => this.copyFile()}>
            Copy File <i className="icon fa fa-clone"></i>
          </MenuItem>
          <MenuItem onClick={() => this.deleteFile()}>
            Delete File <i className="icon fa fa-trash"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}