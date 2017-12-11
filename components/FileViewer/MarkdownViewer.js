import React from 'react'
import fs from 'fs'
import markyMarkdown from 'marky-markdown/dist/marky-markdown.js'

export default class MarkdownViewer extends React.Component {
  listener = ({filepath}) => {
    if (filepath === this.props.filepath) {
      this.loadFile();
    }
  }
  constructor ({filepath, glContainer}) {
    super()
    this.state = {
      content: ''
    }
  }
  loadFile () {
    fs.readFile(this.props.filepath, 'utf8', (err, text) => {
      if (err) return console.log(err)
      this.setState(state => ({...state, content: text}))
    })
  }
  componentDidMount () {
    this.loadFile();
    fs.Events.on('write', this.listener);
  }
  componentWillUnmount () {
    fs.Events.off('write', this.listener);
  }
  render () {
    return <article dangerouslySetInnerHTML={{__html: markyMarkdown(this.state.content)}}></article>
  }
}
