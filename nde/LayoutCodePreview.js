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
    const TryEditableTextFile = TryComponent(EditableTextFile)
    return (
    <article>
      <style>{`
      .splitter-layout .layout-pane {
        overflow: unset;
      }`}
      </style>
      <SplitterLayout primaryIndex={1} secondaryInitialSize={250}>
        <TryFileNavigator root="/"/>
        <SplitterLayout primaryIndex={1} percentage={true} primaryInitialSize={50} secondaryInitialSize={50}>
          <TryEditableTextFile filepath={this.props.filepath}/>
          <div>Preview</div>
        </SplitterLayout>
      </SplitterLayout>
    </article>
    );
  }
}