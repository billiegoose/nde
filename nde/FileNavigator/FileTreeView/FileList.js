import React from 'react'
import path from 'path'

// Import component styles
import './style.css'

export default function FileList ({root, data, statedata, FolderComponent, FileComponent, ...props}) {
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
        <li>
          <FolderComponent
            filename={key}
            filepath={fullpath}
            root={[...root, key]}
            open={open}
            statedata={statedata[fullpath]}
            FolderComponent={FolderComponent}
            FileComponent={FileComponent}
            {...props}>
          </FolderComponent>
          {filelist}
        </li>
      )
    } else {
      files.push(
        <li>
          <FileComponent
            filename={key}
            filepath={fullpath}
            statedata={statedata[fullpath]}
            {...props}>
          </FileComponent>
        </li>
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