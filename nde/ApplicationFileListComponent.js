import React from 'react'
import fs from 'fs'
import path from 'path'
import FileList from './FileTreeView/FileList.js'

export default class ApplicationFileListComponent extends React.Component {
  // componentDidMount () {
  //   let fullname = path.join(...this.props.root, this.props.filename)
  //   fs.readdir(fullname, (err, entries) => {
  //     if (err) return console.log(err)
  //     this.setState({
  //       data: entries
  //     })
  //   })
  // }
  render () {
    return (
      <FileList {...this.props}></FileList>
    )
  }
}