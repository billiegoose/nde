import React from 'react'
import fs from 'fs'
import path from 'path'
import cuid from 'cuid'

// Import component styles
import './style.css'
import 'file-icons-js/css/style.css'

import icons from 'file-icons-js'
import FolderIcon from './FolderIcon.js'

export default class FileTreeView extends React.Component {
  constructor ({glContainer}) {
    super()
    this.state = {
      content: '',
      cuid: cuid()
    }
    
    if (glContainer) {
      glContainer.setTitle('File Navigator')
    }
  }
  render () {
    console.log('icons.getClassWithColor("LICENSE.md") =', icons.getClassWithColor("LICENSE.md"))
    
    const makeFile = (filepath) => {
      let className = 'icon ' + icons.getClassWithColor(filepath);
      return (
        <li>
          <label>
            <a target="#">
              <i className={className}></i>
              {filepath}
            </a>
          </label>
        </li>
      )
    }
    
    const makeFolder = (filepath, children) => {
      let className = 'icon ' + icons.getClassWithColor(filepath);
      let id = cuid();
      return (
        <li>
          <input type="checkbox" name={id} id={id}/>
          <label htmlFor={id}>
            <FolderIcon/>
            {filepath}
          </label>
          <ul>
            {children}
          </ul>
        </li>
      )
    }
    
    let items = [];
    items.push(makeFile('LICENSE.md'));
    items.push(makeFile('README.md'));
    
    let folder = makeFolder('This does not actually work yet', items)
    
    return (
      <nav className="_tree">
        {folder}
      </nav>
    );
  }
}