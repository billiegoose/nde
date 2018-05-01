/* global monaco */
import React from 'react'
import MonacoEditor from 'react-monaco-editor'
import path from 'path'
import download from 'downloadjs'
import { GitWorker } from 'isomorphic-git-worker'

const hotReload = () => {
  System.reload('./nde/app.js')
}

export default class EditableTextFile extends React.Component {
  constructor ({filepath, glContainer}) {
    super()
    this.state = {
      content: null,
      unsavedContent: null,
      language: null
    }
    if (glContainer) {
      glContainer.setTitle(filepath)
    }
  }

  editorDidMount (editor, monaco) {
    // Set language
    let ext = path.extname(this.props.filepath)
    for (let l of monaco.languages.getLanguages()) {
      if (l.extensions.includes(ext)) {
        this.setState({language: l.id})
        break
      }
    }
    // Correct tab size
    editor.getModel().updateOptions({
      tabSize: 2
    })
    editor.updateOptions({
      fontFamily: '"Fira Code", Consolas, "Courier New", monospace',
      fontLigatures: true
    })
    // Extend context menu
    editor.addAction({
      id: 'saveFile',
      label: 'Save File',
      keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S ],
      contextMenuGroupId: '2_custom',
      contextMenuOrder: 0,
      run: (ed) => this.saveFile()
    })
    editor.addAction({
      id: 'downloadFile',
      label: 'Download File',
      contextMenuGroupId: '2_custom',
      contextMenuOrder: 1,
      run: (ed) => this.downloadFile()
    })
    editor.addAction({
      id: 'reloadSavedFile',
      label: 'Reload Saved File',
      contextMenuGroupId: '2_custom',
      contextMenuOrder: 2,
      run: (ed) => this.reloadSavedFile()
    })
    editor.addAction({
      id: 'restoreOriginalFile',
      label: 'Restore Original File',
      contextMenuGroupId: '2_custom',
      contextMenuOrder: 3,
      run: (ed) => this.restoreOriginalFile()
    })
    editor.addAction({
      id: 'preview',
      label: 'Preview',
      contextMenuGroupId: '2_custom',
      contextMenuOrder: 4,
      run: (ed) => this.preview()
    })
    editor.addAction({
      id: 'hotReload',
      label: 'Hot Reload Page',
      contextMenuGroupId: '2_custom',
      contextMenuOrder: 5,
      run: (ed) => hotReload()
    })
  }
  async componentDidMount () {
    try {
      let text = await GitWorker.readFile(this.props.filepath, 'utf8')
      this.setState({ content: text, unsavedContent: text })
    } catch (err) {
      return console.log(err)
    }
  }
  async componentWillReceiveProps ({filepath}) {
    if (filepath !== this.props.filepath) {
      try {
        let text = await GitWorker.readFile(filepath, 'utf8')
        this.setState({content: text, unsavedContent: text})
      } catch (err) {
        return console.log(err)
      }
      // Set language
      let ext = path.extname(filepath)
      for (let l of monaco.languages.getLanguages()) {
        if (l.extensions.includes(ext)) {
          this.setState({language: l.id})
          break
        }
      }
    }
  }
  runCommand () {

  }
  setContainerTitle (title) {
    if (this.props.glContainer) {
      this.props.glContainer.setTitle(title)
    }
  }
  onChange (newValue) {
    // TODO... what to do with file?
    this.setState({
      unsavedContent: newValue
    })
  }
  preview () {
    if (this.props.glContainer) {
      this.props.glContainer.layoutManager.root.contentItems[0].addChild({
        type: 'column',
        content: [{
          type: 'react-component',
          component: 'MarkdownViewer',
          props: { filepath: this.props.filepath }
        }]
      })
    }
  }
  async saveFile () {
    try {
      await GitWorker.writeFile(this.props.filepath, this.state.unsavedContent, 'utf8')
    } catch (err) {
      console.log(err)
    }
  }
  async reloadSavedFile () {
    try {
      let text = await GitWorker.readFile(this.props.filepath, 'utf8')
      this.setState({ content: text, unsavedContent: text })
    } catch (err) {
      return console.log(err)
    }
  }
  restoreOriginalFile () {
    // We add the query parameter to thwart the service-worker.
    fetch(this.props.filepath + '?').then(res => res.text()).then(text => {
      this.setState({content: text, unsavedContent: text})
    }).catch(console.log)
  }
  downloadFile () {
    download(this.state.content, path.basename(this.props.filepath), 'text/plain')
  }
  render () {
    let onChange = this.onChange.bind(this)
    let editorDidMount = this.editorDidMount.bind(this)
    const requireConfig = {
      url: 'https://unpkg.com/requirejs@2.3.5/require.js',
      paths: {
        'vs': './monaco-editor/min/vs'
      }
    }
    const options = {
      automaticLayout: true,
      selectOnLineNumbers: true
    }
    return (
      <MonacoEditor
        theme="vs-dark"
        language={this.state.language}
        value={this.state.unsavedContent || this.state.content}
        options={options}
        onChange={onChange}
        editorDidMount={editorDidMount}
        requireConfig={requireConfig}
      />
    )
  }
}
