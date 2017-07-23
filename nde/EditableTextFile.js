import React from 'react'
import AceEditor from 'react-ace'
import 'brace/theme/monokai'
import fs from 'fs'
import path from 'path'
import { MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import ContextMenu from './ContextMenu.js'
import cuid from 'cuid'

// This function is a total mess. I must be sleep deprived.
const mkdirs = (filename) => {
  return new Promise(function(resolve, reject) {
    let dirname = path.dirname(filename)
    let dirs = dirname.replace(/(^\/)|(\/$)/g, '').split('/').filter(x => x !== '')
    for (let i = 1; i < dirs.length + 1; i++) {
      let dir = dirs.slice(0, i).join('/')
      console.log('dir =', dir)
      try {
        fs.mkdirSync(dir)
      } catch (e) {
        if (e.code !== 'EEXIST') return reject(e)
      }
    }
    resolve()
  });
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
      content: 'Loading...',
      unsavedContent: null,
      cuid: cuid(),
      mode: 'none'
    }
    glContainer.setTitle(filepath)
    glContainer.on('resize', (foo) => {
      this.ace.editor.resize()
    })
  }
  componentDidMount () {
    fs.readFile(this.props.filepath, 'utf8', (err, text) => {
      if (err) return console.log(err)
      this.setState({content: text, unsavedContent: text})
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
      fs.writeFile(this.props.filepath, this.state.unsavedContent, 'utf8', err => console.log)
    }
    const menuFileReset = () => {
      fs.readFile(this.props.filepath, 'utf8', (err, text) => {
        if (err) return console.log(err)
        this.setState({content: text, unsavedContent: text})
      })
    }
    const menuFileRestore = () => {
      // We add the query parameter to thwart the service-worker.
      fetch(this.props.filepath + '?').then(res => res.text()).then(text => {
        this.setState({content: text, unsavedContent: text})
      }).catch(console.log)
    }
    return (
      <article>
        <ContextMenuTrigger id={this.state.cuid}>
          <AceEditor
            ref={(ace) => { this.ace = ace; }}
            mode={this.state.mode}
            theme="monokai"
            width="100%"
            height="100%"
            value={this.state.unsavedContent || this.state.content}
            onChange={onChange}
            style={{fontFamily: 'Fira Code'}}
            editorProps={{$blockScrolling: true}}
          />
        </ContextMenuTrigger>
        <ContextMenu
          id={this.state.cuid}
          onSave={menuFileSave}
          onReset={menuFileReset}
          onRestore={menuFileRestore}
        >
          <MenuItem onClick={menuRun}>
            Run ▶️
          </MenuItem>
        </ContextMenu>
      </article>
    );
  }
}
