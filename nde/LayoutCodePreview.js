import React from 'react'
import SplitterLayout from 'react-splitter-layout';

import TryComponent from './TryCatchHOC.js'
import MarkdownViewer from './MarkdownViewer.js'
import EditableTextFile from './EditableTextFile.js'
import FileNavigator from './FileNavigator/FileNavigator.js'

export default class LayoutCodePreview extends React.Component {
  componentDidMount () {
    if (this.props.glContainer) {
      this.props.glContainer.setTitle('Preview')
    }
  }
  render () {
    const TryFileNavigator = TryComponent(FileNavigator)
    return (
    <article>
      <SplitterLayout primaryIndex={1} secondaryInitialSize={250}>
        <TryFileNavigator root="/"/>
        <SplitterLayout primaryIndex={1} percentage={true} primaryInitialSize={50} secondaryInitialSize={50}>
          <div>Source Code</div>
          <div>Preview</div>
        </SplitterLayout>
      </SplitterLayout>
    </article>
    );
  }
}