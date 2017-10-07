import React from 'react'
import {File, FileIcon} from 'react-file-browser'
import StatusIcon from './StatusIcon'
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
    this.props.glContainer.layoutManager.createDragSource(ReactDOM.findDOMNode(this), {
      type:'react-component',
      component: 'EditableTextFile',
      props: { filepath: this.props.filepath }
    })
  }
  doubleclick () {
    let stack = this.props.glContainer.layoutManager.root.getItemsById('MainEditor')[0]
    stack.addChild({
      type:'react-component',
      component: 'EditableTextFile',
      props: { filepath: this.props.filepath }
    })
  }
  deleteFile () {
    fs.unlink(this.props.filepath)
  }
  async addToIndex () {
    let dir = await git().findRoot(this.props.filepath)
    let rpath = path.relative(dir, this.props.filepath)
    await git(dir).add(rpath)
    this.props.glEventHub.emit('refreshGitStatus', this.props.filepath)
  }
  render () {
    let {disableContextMenu, filename} = this.props
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        <File filename={filename} domProps={{onDoubleClick: this.doubleclick.bind(this)}}>
          &nbsp;<StatusIcon status={this.props.statedata && this.props.statedata.gitstatus || 'unmodified'} />
        </File>

        <ContextMenu id={this.state.cuid}>
          <MenuItem onClick={() => this.deleteFile()}>
            Delete File <i className="icon trash-icon"></i>
          </MenuItem>
          <MenuItem onClick={() => this.addToIndex()}>
            Add to Stage <i className="icon git-icon"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}