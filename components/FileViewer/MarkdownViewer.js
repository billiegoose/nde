import React from 'react'
import {GitWorker} from 'isomorphic-git-worker'
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
  async loadFile () {
    try {
      let text = await GitWorker.readFile(this.props.filepath, 'utf8')
      this.setState(state => ({ ...state, content: text }))
    } catch (err) {
      return console.log(err)
    }
  }
  componentDidMount () {
    this.loadFile();
    GitWorker.Events.on('change', this.listener);
  }
  componentWillUnmount () {
    GitWorker.Events.off('change', this.listener);
  }
  render () {
    return <article dangerouslySetInnerHTML={{__html: markyMarkdown(this.state.content)}}></article>
  }
}
