import React from 'react'
import FolderIcon from './FolderIcon.js'

export default function Folder ({filename, open, domProps, children}) {
  return (
    <label {...domProps}>
      <a target="#" style={{whiteSpace: 'nowrap', position: 'relative'}}>
        <FolderIcon open={open}/>
        {children}
      </a>
    </label>
  )
}
