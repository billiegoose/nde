import React from 'react'
import fs from 'fs'
import path from 'path'
import markyMarkdown from 'marky-markdown/dist/marky-markdown.js'
import cuid from 'cuid'

function fetchFromLocalFS (src) {
  // This makes sure that ./README.md gets saved to /nde/README.md and ../README.md gets saved to /README.md
  src = path.path(path.resolve(src))
  return new Promise(function(resolve, reject) {
    fs.readFile(src, 'utf8', (err, file) => {
      return err ? reject(err) : resolve(file)
    })
  })
}

function fetchDefaultFile (src) {
  return fetch(src).then(res => res.text()).then(text => {
    return new Promise(function(resolve, reject) {
      fs.writeFile(src, text, err => err ? reject(err) : resolve(text))
    })
  })
}

export default class MarkdownViewer extends React.Component {
  constructor ({filepath, glContainer}) {
    super()
    this.state = {
      content: '',
      cuid: cuid()
    }
    fetchFromLocalFS(filepath)
    .then(text => this.setState({content: text}))
    .catch(err => {
      fetchDefaultFile(filepath)
      .then(text => this.setState({content: text}))
      .catch(err => console.log)
    })
    
    if (glContainer) {
      glContainer.setTitle(filepath)
    }
  }
  render () {
    return <article dangerouslySetInnerHTML={{__html: markyMarkdown(this.state.content)}}></article>;
  }
}