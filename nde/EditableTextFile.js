import React from 'react'
import AceEditor from 'react-ace'
import 'brace/theme/monokai'
import fs from 'fs'
import path from 'path'
import mkdirp from 'make-dir'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import cuid from 'cuid'

function fetchFromLocalFS (src) {
  // This makes sure that ./README.md gets saved to /nde/README.md and ../README.md gets saved to /README.md
  src = path.path(path.resolve(src))
  console.log('read src =', src)
  return new Promise(function(resolve, reject) {
    fs.readFile(src, 'utf8', (err, file) => {
      return err ? reject(err) : resolve(file)
    })
  })
}

function fetchDefaultFile (src) {
  console.log('fetch src =', src)
  return fetch(src).then(res => res.text()).then(text => {
    return new Promise(function(resolve, reject) {
      // This makes sure that ./README.md gets saved to /nde/README.md and ../README.md gets saved to /README.md
      src = path.path(path.resolve(src))
      console.log('save src =', src)
      console.log('mkdirp src =', path.dirname(src))
      mkdirp(path.dirname(src)).then(() => {
        fs.writeFile(src, text, err => err ? reject(err) : resolve(text))
      }).catch(() => {
        fs.writeFile(src, text, err => err ? reject(err) : resolve(text))
      })
    })
  })
}

export default class EditableTextFile extends React.Component {
  constructor ({filepath, glContainer}) {
    super()
    let mode = null
    if (filepath.endsWith('.md')) {
      mode = 'markdown'
    } else if (filepath.endsWith('.js')) {
      mode = 'javascript'
    }
    if (mode) {
      System.import('brace/mode/' + mode).then( () => {
        this.setState({mode: mode})
      })
    }
    this.state = {
      content: '',
      unsavedContent: null,
      cuid: cuid(),
      mode: 'none'
    }
    fetchFromLocalFS(filepath)
    .then(text => this.setState({content: text, unsavedContent: text}))
    .catch(err => {
      fetchDefaultFile(filepath)
      .then(text => this.setState({content: text, unsavedContent: text}))
      .catch(err => console.log)
    })
    
    glContainer.setTitle(filepath)
    glContainer.on('tab', tab => {
      console.log('tab =', tab.element)
    })
  }
  runCommand () {
    return
  }
  setContainerTitle (title) {
    this.props.glContainer.setTitle(title)
  }
  onChange (newValue) {
    // TODO... what to do with file?
    this.setState({
      unsavedContent: newValue
    })
  }
  render () {
    let onChange = this.onChange.bind(this)
    let menuRun = this.runCommand.bind(this)
    const menuFileSave = () => {
      fs.writeFile(this.props.filepath, this.state.unsavedContent, err => console.log)
    }
    const menuFileReset = () => {
      fetchFromLocalFS(this.props.filepath)
      .then(text => this.setState({content: text, unsavedContent: text}))
      .catch(console.log)
    }
    const menuFileRestore = () => {
      fetchDefaultFile(this.props.filepath)
      .then(text => this.setState({content: text, unsavedContent: text}))
      .catch(console.log)
    }
    return (
      <article>
        <ContextMenuTrigger id={this.state.cuid}>
          <AceEditor
            mode={this.state.mode}
            theme="monokai"
            width="100%"
            height="100%"
            value={this.state.unsavedContent || this.state.content}
            onChange={onChange}
            editorProps={{$blockScrolling: true}}
          />
        </ContextMenuTrigger>
        <ContextMenu id={this.state.cuid}>
          <MenuItem data={"some_data"} onClick={menuFileSave}>
            Save
          </MenuItem>
          <MenuItem data={"some_data"} onClick={menuFileReset}>
            Reset
          </MenuItem>
          <MenuItem data={"some_data"} onClick={menuFileRestore}>
            Restore (original)
          </MenuItem>
          <MenuItem divider />
          <MenuItem data={"some_data"} onClick={menuRun}>
            Run ▶️
          </MenuItem>
        </ContextMenu>
      </article>
    );
  }
}
