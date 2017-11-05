import React from 'react'
import SplitterLayout from 'react-splitter-layout';

import TryComponent from './TryCatchHOC.js'
import FileViewer from './FileViewer.js'
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
    const TryFileViewer = TryComponent(FileViewer)
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
          <TryFileViewer filepath={this.props.filepath}/>
        </SplitterLayout>
      </SplitterLayout>
    </article>
    );
  }
}