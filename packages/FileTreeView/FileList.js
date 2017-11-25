import React from 'react'
import path from 'path'

const findDirectChildren = (filepath, filepaths) =>
  filepaths.filter(x => x.length > filepath.length)
    .filter(x => x.startsWith(filepath))
    .filter(x => x.lastIndexOf('/') <= filepath.length)
    .sort()

const getChildren = (filepath, fileMap) => {
  let keys = Object.keys(fileMap)
  let filepaths = findDirectChildren(filepath, keys)
}

export default function FileList ({filepath, fileMap, FolderComponent, FileComponent, ...props}) {
  // new implementation
  if (fileMap !== undefined) {
    let folders = []
    let files = []

    let keys = Object.keys(fileMap)
    let filepaths = findDirectChildren(filepath, keys)

    for (let key of filepaths) {
      if (fileMap[key].type === 'dir') {
        let open = fileMap[key].navOpen
        let filelist
        if (open) {
          filelist = (
            <FileList
              filepath={key}
              fileMap={fileMap}
              FolderComponent={FolderComponent}
              FileComponent={FileComponent}
              {...props}>
            </FileList>
          )
        }
        folders.push(
          <li key={key}>
            <FolderComponent
              filename={path.basename(key)}
              filepath={key}
              fileMap={fileMap}
              open={open}
              {...props}>
            </FolderComponent>
            {filelist}
          </li>
        )
      } else {
        files.push(
          <li key={key}>
            <FileComponent
              filename={path.basename(key)}
              filepath={key}
              fileMap={fileMap}
              {...props}>
            </FileComponent>
          </li>
        )
      }
    }
    let entries = folders.concat(files)
    return (
      <ul>
        {entries}
      </ul>
    )
  }
}
