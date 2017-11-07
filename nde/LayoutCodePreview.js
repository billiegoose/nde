import path from 'path'
import React from 'react'
import SplitterLayout from 'react-splitter-layout'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'

import {FileIcon} from 'react-file-browser'

import TryComponent from './TryCatchHOC.js'
import FileViewer from './FileViewer.js'
import EditableTextFile from './EditableTextFile.js'
import FileNavigator from './FileNavigator/FileNavigator.js'

const TryFileNavigator = TryComponent(FileNavigator)
const TryEditableTextFile = TryComponent(EditableTextFile)
const TryFileViewer = TryComponent(FileViewer)

const activeTabStyle = {color: 'white', background: '#1e1e1e', border: '1px solid', borderBottom: 'none', borderTopLeftRadius: '10px'} 
const inactiveTabStyle = {color: '#6d6d6d', background: '#000000', border: '1px solid', borderBottom: 'none', borderTopLeftRadius: '10px'}

const Tab = SortableElement(
  ({currentIndex: index, filepath, active, onTabClick, onTabClose}) => {
    if (active) {
      return <li style={{
        display: 'inline-block',
        padding: "5px",
        whiteSpace: 'nowrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        ...activeTabStyle
      }}
      title={filepath}
      onClick={() => onTabClick({index, filepath})}>
        <i className="fa fa-window-close" onClick={(e) => { e.stopPropagation(); onTabClose({index}) }}></i>
        {' ' + path.basename(filepath)}
      </li>
    } else {
      return <li style={{
        display: 'inline-block',
        padding: "5px",
        whiteSpace: 'nowrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        ...inactiveTabStyle
      }}
      title={filepath}
      onClick={() => onTabClick({index, filepath})}>
        <FileIcon style={{verticalAlign: 'unset'}} filename={filepath} />
        {path.basename(filepath)}
      </li>
    }
  }
)

const TabList = SortableContainer(
  ({items, onTabClick, onTabClose}) => (
    <ul style={{display: 'block', padding: 0, margin: 0, lineHeight: 0, color: '#4078c0', background: 'black', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'}}>
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
          filepath: '/nde/README.md',
          scrollPosition: 0,
          active: true
        },
        {
          filepath: '/nde/nde/app.js',
          scrollPosition: 0,
          active: false
        },
        {
          filepath: '/nde/nde/EditableTextFile.js',
          scrollPosition: 0,
          active: false
        },
        {
          filepath: '/nde/nde/LayoutCodePreview.js',
          scrollPosition: 0,
          active: false
        },
        {
          filepath: '/nde/nde/MarkdownViewer.js',
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
    EventHub.on('openFile', (filepath) => {
      this.setState(state => {
        // Don't open multiple instances of the same file.
        let i = this.state.openFiles.findIndex(x => x.filepath === filepath)
        if (i > -1) {
          console.log('i = ', i)
          state.openFiles.map(item => item.active = false)
          state.openFiles[i].active = true
          return state
        }
        // Open the file and insert to the right of the active tab
        // and make the new tab the active tab.
        const insertAfter = this.state.openFiles.findIndex(item => item.active)
        const oldActiveTab = this.state.openFiles[insertAfter]
        state.openFiles.splice(insertAfter + 1, 0, {
          filepath,
          scrollPosition: 0,
          active: true
        })
        oldActiveTab.active = false
        return state
      })
    })
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