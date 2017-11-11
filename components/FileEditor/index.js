import React from 'react'
import TextEditor from './TextEditor'

export default class FileViewer extends React.Component {
  render () {
    if (this.props.filepath) {
      return <TextEditor filepath={this.props.filepath}/>
    } else {
      // TODO: Uses mime type detection to determine if it is text or binary
      return <article>{'No preview available for this filetype'}</article>
    }
  }
}
