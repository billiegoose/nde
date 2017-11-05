import React from 'react'
import fs from 'fs'
import path from 'path'
import markyMarkdown from 'marky-markdown/dist/marky-markdown.js'
import cuid from 'cuid'
import MarkdownViewer from './MarkdownViewer'

export default class FileViewer extends React.Component {
  constructor ({filepath, glContainer}) {
    super()
    // this.state = {
    //   content: '',
    //   cuid: cuid()
    // }
    if (glContainer) {
      glContainer.setTitle('Preview ' + filepath)
    }
  }
  // componentDidMount () {
  //   fs.readFile(this.props.filepath, 'utf8', (err, text) => {
  //     if (err) return console.log(err)
  //     this.setState(state => ({...state, content: text}))
  //   })
  // }
  render () {
    if (this.props.filepath && this.props.filepath.endsWith('.md')) {
      return <MarkdownViewer filepath={this.props.filepath}/>
    } else {
      return <article>{'No preview available for this filetype'}</article>
    }
  }
}