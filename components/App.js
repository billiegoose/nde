/* global EventHub */
import React from 'react'
import { connect } from 'react-redux'
import SplitterLayout from 'react-splitter-layout'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { ErrorBoundary } from 'react-pretty-error-boundary'

import { newTab, undo, redo } from './store.js'
import TryComponent from './TryCatchHOC.js'
import FileNavigator from './FileNavigator/FileNavigator.js'
import FileEditor from './FileEditor/index.js'
import FileViewer from './FileViewer/index.js'
import FileTabs from './FileTabs.js'

const TryFileNavigator = TryComponent(FileNavigator)
const TryFileEditor = TryComponent(FileEditor)
const TryFileViewer = TryComponent(FileViewer)
const TryFileTabs = TryComponent(FileTabs)

const mapStateToProps = (state) => {
  return {
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    activeFilepath: state.present.activeFilepath
  }
}
const mapDispatchToProps = (dispatch) => ({
  onTabOpen (filepath) {
    dispatch(newTab(filepath))
  },
  onUndo () {
    dispatch(undo())
  },
  onRedo () {
    dispatch(redo())
  }
})

class App extends React.Component {
  componentDidMount () {
    EventHub.on('openFile', this.props.onTabOpen)
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
          <TryFileNavigator root="/" filepath="/"/>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <TryFileTabs/>
              <div style={{color: 'white'}}>
                <button title="Undo" disabled={!this.props.canUndo} style={{color: this.props.canUndo ? 'white' : 'grey', background: 'none', border: 'none'}} onClick={this.props.onUndo}><i className="fa fa-fw fa-undo"></i></button>
                <button title="Redo" disabled={!this.props.canRedo} style={{color: this.props.canRedo ? 'white' : 'grey', background: 'none', border: 'none'}} onClick={this.props.onRedo}><i className="fa fa-fw fa-repeat"></i></button>
                <a rel="nofollower noopener" target="_blank" href="https://github.com/wmhilton/nde/commits/master"><button title="Commits" style={{color: 'white', background: 'none', border: 'none'}}><i className="fa fa-fw fa-github"></i></button></a>
              </div>
            </div>
            <SplitterLayout primaryIndex={1} percentage={true} primaryInitialSize={50} secondaryInitialSize={50}>
              <ErrorBoundary><FileEditor filepath={this.props.activeFilepath}/></ErrorBoundary>
              <ErrorBoundary><FileViewer filepath={this.props.activeFilepath}/></ErrorBoundary>
            </SplitterLayout>
          </div>
        </SplitterLayout>
      </article>
    )
  }
}

const SmartApp = connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(App))

export default SmartApp
