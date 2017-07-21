import React from 'react'
import fs from 'fs'
import path from 'path'
import cuid from 'cuid'

// Import component styles
import './style.css'
import 'file-icons-js/css/style.css'
import icons from 'file-icons-js'

import FileComponent from './FileComponent.js'
import FolderComponent from './FolderComponent.js'

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

    const makeOpenHandler = (root, key, id) => () => {
      let filepath = path.join(...root, key)
      this.props.onClick({filepath, id})
    }
    
    const makeList = (root, data) => {
      let items = []
      for (let [key, value] of Object.entries(data)) {
        if (value) {
          let children = makeList([...root, key], value);
          items.push(<FolderComponent filename={key}>{children}</FolderComponent>);
        } else {
          let id = cuid();
          let onClick = makeOpenHandler(root, key, id);
          items.push(<FileComponent filename={key} onClick={onClick} cuid={id}/>);
        }
      }
      return items
    }
    
    let folder = makeList([], this.props.data);
    return (
      <nav className="_tree">
        <ul>
          {folder}
        </ul>
      </nav>
    );
  }
}