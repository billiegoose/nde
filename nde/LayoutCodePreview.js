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
  ({currentIndex: index, filepath, active, onTabClick, onTabClose}) => <li style={{
      display: 'inline-block',
      padding: "5px 10px",
      whiteSpace: 'nowrap',
      width: '100px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      ...(active ? activeTabStyle : inactiveTabStyle)
    }}
    onClick={() => onTabClick({index, filepath})}>
      <i className="fa fa-window-close" onClick={(e) => { e.stopPropagation(); onTabClose({index}) }}></i> {filepath}
    </li>
)

const TabList = SortableContainer(
  ({items, onTabClick, onTabClose}) => (
    <ul style={{display: 'block', padding: 0, margin: 0, lineHeight: 0, color: '#4078c0', background: '#d9dbde', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'}}>
    {
      items.map(
        (item, index) => 
          <Tab key={`item-${index}`}
            index={index}
            currentIndex={index}
            filepath={item.filepath}
            active={item.active}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
          />
      )
    }
    </ul>
  )
)

export default class LayoutCodePreview extends React.Component {
  constructor () {
    super()
    this.state = {
      openFiles: [
        {
          filepath: 'nde/README.md',
          scrollPosition: 0,
          active: true
        },
        {
          filepath: 'nde/nde/app.js',
          scrollPosition: 0,
          active: false
        },
        {
          filepath: 'nde/nde/EditableTextFile.js',
          scrollPosition: 0,
          active: false
        },
        {
          filepath: 'nde/nde/LayoutCodePreview.js',
          scrollPosition: 0,
          active: false
        },
        {
          filepath: 'nde/nde/MarkdownViewer.js',
          scrollPosition: 0,
          active: false
        }
      ]
    }
  }
  componentDidMount () {
    if (this.props.glContainer) {
      this.props.glContainer.setTitle('Preview')
    }
  }
  onTabReorder ({oldIndex, newIndex}) {
    this.setState(state => {
      state.openFiles = arrayMove(state.openFiles, oldIndex, newIndex)
      return state
    })
  }
  onTabClick ({index}) {
    this.setState(state => {
      state.openFiles.map(item => item.active = false)
      state.openFiles[index].active = true
      return state
    })
  }
  onTabClose ({index}) {
    this.setState(state => {
      const removed = state.openFiles.splice(index, 1)
      if (removed && removed[0] && removed[0].active) {
        state.openFiles[Math.max(0, index - 1)].active = true
      }
      return state
    })
  }
  render () {
    const activeTab = this.state.openFiles.find(item => item.active)
    const activeFilepath = activeTab ? activeTab.filepath : undefined //'nde/README.md'
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
          <TabList items={this.state.openFiles} axis="x" lockAxis="x" lockToContainerEdges={true} lockOffset="0%" distance={25} onSortEnd={this.onTabReorder.bind(this)} onTabClick={this.onTabClick.bind(this)} onTabClose={this.onTabClose.bind(this)}/>
          <SplitterLayout primaryIndex={1} percentage={true} primaryInitialSize={50} secondaryInitialSize={50}>
            <TryEditableTextFile filepath={activeFilepath}/>
            <TryFileViewer filepath={activeFilepath}/>
          </SplitterLayout>
        </div>
      </SplitterLayout>
    </article>
    );
  }
}