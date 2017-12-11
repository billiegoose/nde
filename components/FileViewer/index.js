import React from 'react'
import MarkdownViewer from './MarkdownViewer'
import ReactComponentViewer from './ReactComponentViewer'
import { ErrorBoundary } from 'react-pretty-error-boundary'

const style = {
  backgroundColor: '#1e1e1e',
  color: 'white',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: '2em'
}

export default class FileViewer extends React.Component {
  constructor ({filepath}) {
    super()
  }
  render () {
    if (this.props.filepath && this.props.filepath.endsWith('.md')) {
      return <ErrorBoundary><MarkdownViewer filepath={this.props.filepath}/></ErrorBoundary>
    } else if (this.props.filepath && this.props.filepath.endsWith('.jsx')) {
      return <ErrorBoundary><ReactComponentViewer filepath={this.props.filepath}/></ErrorBoundary>
    } else {
      return <article style={style}>{'No preview available for this filetype'}</article>
    }
  }
}
