import React from 'react'
import AceEditor from 'react-ace'
import 'brace/theme/monokai'
import fs from 'fs'
import path from 'path'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import cuid from 'cuid'

const hotReload = () => {
  System.reload('./nde/app.js')
}

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
    // Thanks https://github.com/joemccann/dillinger/issues/66
    this.ace.editor.commands.addCommand({
      name: 'saveFile',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S',
        sender: 'editor|cli'
      },
      exec: (env, args, request) => {
       this.saveFile()
      }
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
  saveFile () {
    fs.writeFile(this.props.filepath, this.state.unsavedContent, 'utf8', err => console.log)
  }
  reloadSavedFile () {
    fs.readFile(this.props.filepath, 'utf8', (err, text) => {
      if (err) return console.log(err)
      this.setState({content: text, unsavedContent: text})
    })
  }
  restoreOriginalFile () {
    // We add the query parameter to thwart the service-worker.
    fetch(this.props.filepath + '?').then(res => res.text()).then(text => {
      this.setState({content: text, unsavedContent: text})
    }).catch(console.log)
  }
  render () {
    let onChange = this.onChange.bind(this)
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
        <ContextMenu id={this.state.cuid}>
          <MenuItem onClick={hotReload}>
            Hot Reload Page
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => this.saveFile()}>
            Save File
          </MenuItem>
          <MenuItem onClick={() => this.reloadSavedFile()}>
            Reload Saved File
          </MenuItem>
          <MenuItem onClick={() => this.restoreOriginalFile()}>
            Restore Original File
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => this.runCommand()}>
            Run <span className="icon">▶️</span>
          </MenuItem>
        </ContextMenu>
      </article>
    );
  }
}
