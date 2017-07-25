import React from 'react'
import path from 'path'

// Import component styles
import './style.css'

export default class FileList extends React.Component {
  render () {
    let {root, data, FolderComponent, FileComponent, ...props} = this.props
    root = root || []
    let folders = []
    let files = []
    for (let [key, value] of Object.entries(data)) {
      if (value) {
        folders.push(
          <FolderComponent
            filename={key}
            root={[...root, key]}
            data={value}
            FolderComponent={FolderComponent}
            FileComponent={FileComponent}
            {...props}>
          </FolderComponent>
        )
      } else {
        files.push(
          <FileComponent
            filename={key}
            filepath={path.join(...root, key)}
            {...props}>
          </FileComponent>
        );
      }
    }
    let entries = folders.concat(files)
    return (
      <ul>
        {entries}
      </ul>
    );
  }
}