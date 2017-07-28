import React from 'react'
import fs from 'fs'
import path from 'path'
import markyMarkdown from 'marky-markdown/dist/marky-markdown.js'
import cuid from 'cuid'

export default class MarkdownViewer extends React.Component {
  constructor ({filepath, glContainer}) {
    super()
    let glState = glContainer.getState()
    console.log(glState)
    this.state = glState ? glState : {
      content: '',
      cuid: cuid()
    }
    fs.readFile(filepath, 'utf8', (err, text) => {
      if (err) return console.log(err)
      this.setState({content: text})
    })
    
    if (glContainer) {
      glContainer.setTitle(filepath)
    }
  }
  componentDidUpdate (oldprops, oldstate) {
    this.props.glContainer.setState(this.state)
  }
  render () {
    return <article dangerouslySetInnerHTML={{__html: markyMarkdown(this.state.content)}}></article>;
  }
}