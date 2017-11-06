import React from 'react'
import SplitterLayout from 'react-splitter-layout'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'

import TryComponent from './TryCatchHOC.js'
import FileViewer from './FileViewer.js'
import EditableTextFile from './EditableTextFile.js'
import FileNavigator from './FileNavigator/FileNavigator.js'

const TryFileNavigator = TryComponent(FileNavigator)
const TryEditableTextFile = TryComponent(EditableTextFile)
const TryFileViewer = TryComponent(FileViewer)

const activeTabStyle = {color: 'white', background: '#1e1e1e', border: '1px solid', borderBottom: 'none', borderTopLeftRadius: '5px'}
const inactiveTabStyle = {color: '#6d6d6d', background: '#000000'}

const Tab = SortableElement(
  ({title, active}) => <li style={{
      display: 'inline-block',
      padding: "5px 10px",
      whiteSpace: 'nowrap',
      width: '100px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      ...(active ? activeTabStyle : inactiveTabStyle)
    }}>
      <i className="fa fa-window-close"></i> {title}
    </li>
)

const TabList = SortableContainer(
  ({items}) => (
    <ul style={{display: 'block', padding: 0, margin: 0, lineHeight: 0, color: '#4078c0', background: '#d9dbde', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'}}>
    {
      items.map(
        (value, index) => 
          <Tab key={`item-${index}`} index={index} title={value.title} active={value.active}/>
      )
    }
    </ul>
  )
)

export default class LayoutCodePreview extends React.Component {
  constructor () {
    super()
    this.state = {
      tabs: [
        { title: 'Active Tab', active: true },
        { title: 'Inactive Tab With Long Name', active: false }
      ]
    }
  }
  componentDidMount () {
    if (this.props.glContainer) {
      this.props.glContainer.setTitle('Preview')
    }
  }
  onTabReorder ({oldIndex, newIndex}) {
    this.setState(state => ({
      ...state,
      tabs: arrayMove(state.tabs, oldIndex, newIndex)
    }))
  }
  render () {
    return (
    <article>
      <style>{`
      .splitter-layout .layout-pane {
        overflow: unset;
      }`}
      </style>
      <SplitterLayout primaryIndex={1} secondaryInitialSize={250}>
        <TryFileNavigator root="/"/>
        <div>
          <TabList items={this.state.tabs} axis="x" lockAxis="x" lockToContainerEdges={true} lockOffset="0%" onSortEnd={this.onTabReorder.bind(this)}/>
          <SplitterLayout primaryIndex={1} percentage={true} primaryInitialSize={50} secondaryInitialSize={50}>
            <TryEditableTextFile filepath={this.props.filepath}/>
            <TryFileViewer filepath={this.props.filepath}/>
          </SplitterLayout>
        </div>
      </SplitterLayout>
    </article>
    );
  }
}