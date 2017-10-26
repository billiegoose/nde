import React from 'react'
import fs from 'fs'
import path from 'path'
import markyMarkdown from 'marky-markdown/dist/marky-markdown.js'
import cuid from 'cuid'

export default class MarkdownViewer extends React.Component {
  constructor ({filepath, glContainer}) {
    super()
    this.state = {
      content: '',
      cuid: cuid()
    }
  }
  componentDidMount () {
    if (glContainer) {
      glContainer.setTitle(filepath)
    }
    fs.readFile(filepath, 'utf8', (err, text) => {
      if (err) return console.log(err)
      this.setState(state => ({...state, content: text}))
    })
  }
  render () {
    return <article dangerouslySetInnerHTML={{__html: markyMarkdown(this.state.content)}}></article>;
  }
}