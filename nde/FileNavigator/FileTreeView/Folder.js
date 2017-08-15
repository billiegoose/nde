import React from 'react'
import FolderIcon from './FolderIcon.js'
import FileList from './FileList.js'

import './style.css'

export default function Folder ({filename, open, ...props}) {
  // remove excess props to avoid warning, but allow any event handlers like onClick, onDoubleClick, etc through
  let {filepath, root, statedata, children, FolderComponent, FileComponent, glEventHub, glContainer, ...passedProps} = props
  return (
    <label {...passedProps}>
      <a target="#">
        <FolderIcon open={open}/>
        {filename}
        {children}
      </a>
    </label>
  )
}