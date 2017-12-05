/* global EventHub */
import React from 'react'
import path from 'path'

export class EditableFilename extends React.Component {
  cancel () {
    EventHub.emit('setFolderStateData', {
      fullpath: path.basename(this.props.filepath),
      key: 'editingName',
      value: false
    })
  }
  save () {
    EventHub.emit('renameFile', {
      from: this.props.filepath,
      to: path.join(path.dirname(this.props.filepath), this.props.tentativeFilename)
    })
    EventHub.emit('setFolderStateData', {
      fullpath: this.props.filepath,
      key: 'editingName',
      value: false
    })
  }
  handleChange (e) {
    EventHub.emit('setFolderStateData', {
      fullpath: this.props.filepath,
      key: 'tentativeFilename',
      value: e.target.value
    })
  }
  handleKeyDown (e) {
    if (e.key === 'Enter') {
      this.save()
    }
  }
  render () {
    return (
      <span>{this.props.editing
      ? <input
        value={this.props.tentativeFilename}
        onChange={this.handleChange.bind(this)}
        onBlur={() => this.cancel()}
        onKeyDown={this.handleKeyDown.bind(this)}
        />
      : this.props.filename}
      </span>
    )
  }
}
