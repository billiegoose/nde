import React from 'react'
import path from 'path'
import { connect } from 'react-redux'
import { FileIcon } from 'react-file-browser'
import { SortableTabList } from './Tabs/TabList.js'
import { activateTab, closeTab, moveTab, newTab } from './store.js'

const mapStateToProps = (state) => {
  return {
    items: state.present.openFiles.map(x => {
      return {
        id: x.filepath,
        text: path.basename(x.filepath),
        tooltip: x.filepath,
        active: x.filepath === state.present.activeFilepath,
        icon: <FileIcon style={{verticalAlign: 'unset'}} filename={x.filepath} />
      }
    })
  }
}
const mapDispatchToProps = (dispatch) => ({
  onTabReorder ({oldIndex, newIndex}) {
    dispatch(moveTab(oldIndex, newIndex))
  },
  onTabClick (filepath) {
    dispatch(activateTab(filepath))
  },
  onTabClose (filepath) {
    dispatch(closeTab(filepath))
  },
  onTabOpen (filepath) {
    dispatch(newTab(filepath))
  }
})

const FileTabList = ({items, onTabReorder, onTabClick, onTabClose}) => (
  <SortableTabList
    items={items}
    axis="x"
    lockAxis="x"
    lockToContainerEdges={true}
    lockOffset="0%"
    distance={25}
    onSortEnd={onTabReorder}
    onTabClick={onTabClick}
    onTabClose={onTabClose}
  />
)
const ConnectedFileTabList = connect(mapStateToProps, mapDispatchToProps)(FileTabList)

export default ConnectedFileTabList
