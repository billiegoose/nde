import React from 'react'
import File from './FileTreeView/File.js'

export default class FileNavigatorFileComponent extends React.Component {
  componentDidMount () {
    this.props.glContainer.layoutManager.createDragSource(ReactDOM.findDOMNode(this), {
      type:'react-component',
      component: 'EditableTextFile',
      props: { filepath: this.props.filepath }
    })
  }
  doubleclick () {
    this.props.glContainer.layoutManager.root.getItemsByType('stack')[0].addChild({
      type:'react-component',
      component: 'EditableTextFile',
      props: { filepath: this.props.filepath }
    })
  }
  render () {
    return (
      <File onDoubleClick={this.doubleclick.bind(this)} {...this.props}></File>
    )
  }
}