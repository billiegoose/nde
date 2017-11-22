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

export default function FileList ({root, data, filepath, fileMap, statedata, FolderComponent, FileComponent, ...props}) {
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
  // old implementation
  root = root || []
  let folders = []
  let files = []
  for (let [key, value] of Object.entries(data)) {
    let fullpath = path.join(...root, key)
    if (value) {
      let open = statedata[fullpath] && statedata[fullpath].open
      let filelist
      if (open) {
        filelist = (
          <FileList
            root={[...root, key]}
            data={value}
            statedata={statedata}
            FolderComponent={FolderComponent}
            FileComponent={FileComponent}
            {...props}>
          </FileList>
        )
      }
      folders.push(
        <li key={fullpath}>
          <FolderComponent
            filename={key}
            filepath={fullpath}
            root={[...root, key]}
            open={open}
            statedata={statedata[fullpath]}
            {...props}>
          </FolderComponent>
          {filelist}
        </li>
      )
    } else {
      files.push(
        <li key={fullpath}>
          <FileComponent
            filename={key}
            filepath={fullpath}
            statedata={statedata[fullpath]}
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
