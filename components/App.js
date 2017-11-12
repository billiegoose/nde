import path from 'path'
import React from 'react'
import { connect } from 'react-redux'
import SplitterLayout from 'react-splitter-layout'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'

import {FileIcon} from 'react-file-browser'

import { activateTab, closeTab, moveTab, newTab  } from './store.js'

import TryComponent from './TryCatchHOC.js'
import FileNavigator from './FileNavigator/FileNavigator.js'
import FileEditor from './FileEditor/index.js'
import FileViewer from './FileViewer/index.js'

const TryFileNavigator = TryComponent(FileNavigator)
const TryFileEditor = TryComponent(FileEditor)
const TryFileViewer = FileViewer // TryComponent(FileViewer)

const activeTabStyle = {color: 'white', background: '#1e1e1e', border: '1px solid', borderBottom: 'none', borderTopLeftRadius: '10px'}
const inactiveTabStyle = {color: '#6d6d6d', background: '#000000', border: '1px solid', borderBottom: 'none', borderTopLeftRadius: '10px'}

const Tab = SortableElement(
  ({currentIndex: index, filepath, active, onTabClick, onTabClose}) => {
    if (active) {
      return <li style={{
        display: 'inline-block',
        padding: '5px',
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
        padding: '5px',
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

const mapStateToProps = (state) => state
const mapDispatchToProps = (dispatch) => ({
  onTabReorder ({oldIndex, newIndex}) {
    dispatch(moveTab(oldIndex, newIndex))
  },
  onTabClick ({index}) {
    dispatch(activateTab(index))
  },
  onTabClose ({index}) {
    dispatch(closeTab(index))
  },
  onTabOpen (filepath) {
    dispatch(newTab(filepath))
  }
})

class App extends React.Component {
  componentDidMount () {
    EventHub.on('openFile', this.props.onTabOpen)
  }
  render () {
    const activeTab = this.props.openFiles.find(item => item.active)
    const activeFilepath = activeTab ? activeTab.filepath : undefined // 'nde/README.md'
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
            <TabList items={this.props.openFiles} axis="x" lockAxis="x" lockToContainerEdges={true} lockOffset="0%" distance={25} onSortEnd={this.props.onTabReorder} onTabClick={this.props.onTabClick} onTabClose={this.props.onTabClose}/>
            <SplitterLayout primaryIndex={1} percentage={true} primaryInitialSize={50} secondaryInitialSize={50}>
              <TryFileEditor filepath={activeFilepath}/>
              <TryFileViewer filepath={activeFilepath}/>
            </SplitterLayout>
          </div>
        </SplitterLayout>
      </article>
    )
  }
}

const SmartApp = connect(mapStateToProps, mapDispatchToProps)(App)

export default SmartApp
