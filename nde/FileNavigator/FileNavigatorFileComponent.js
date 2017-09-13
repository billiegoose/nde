import React from 'react'
import {File, FileIcon} from 'react-file-browser'
import StatusIcon from './StatusIcon'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import fs from 'fs'
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
    this.props.glContainer.layoutManager.root.getItemsByType('stack')[0].addChild({
      type:'react-component',
      component: 'EditableTextFile',
      props: { filepath: this.props.filepath }
    })
  }
  deleteFile () {
    fs.unlink(this.props.filepath)
  }
  render () {
    let {disableContextMenu, filename} = this.props
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        <File filename={filename} domProps={{onDoubleClick: this.doubleclick.bind(this)}}>
          &nbsp;<StatusIcon status='untracked' />
        </File>

        <ContextMenu id={this.state.cuid}>
          <MenuItem onClick={() => this.deleteFile()}>
            Delete File <i className="icon trash-icon"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}