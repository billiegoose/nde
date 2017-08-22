import React from 'react'
import FolderIcon from './FolderIcon.js'
import FileList from './FileList.js'

import './style.css'

export default function Folder ({filename, open, domProps, children}) {
  return (
    <label {...domProps}>
      <a target="#">
        <FolderIcon open={open}/>
        {filename}
        {children}
      </a>
    </label>
  )
}