import React from 'react'
import fs from 'fs'
import path from 'path'
import markyMarkdown from 'marky-markdown/dist/marky-markdown.js'
import cuid from 'cuid'
import MarkdownViewer from './MarkdownViewer'
import ReactComponentViewer from './ReactComponentViewer'
import ErrorBoundary from '../ErrorBoundary/index.js'

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
      return <ErrorBoundary><MarkdownViewer filepath={this.props.filepath}/></ErrorBoundary>
    } else if (this.props.filepath && this.props.filepath.endsWith('.jsx')) {
      return <ErrorBoundary><ReactComponentViewer filepath={this.props.filepath}/></ErrorBoundary>
    } else {
      return <article>{'No preview available for this filetype'}</article>
    }
  }
}