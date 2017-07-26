import React from 'react'
import FolderIcon from './FolderIcon.js'
import FileList from './FileList.js'

import './style.css'

export default function Folder ({filename, open, ...props}) {
  return (
    <label {...props}>
      <a target="#">
        <FolderIcon open={open}/>
        {filename}
      </a>
    </label>
  )
}