import { createStore } from 'redux'
import undoable from 'redux-undo'
import { arrayMove } from 'react-sortable-hoc'

const NEW_TAB = 'OPEN_TAB'
const CLOSE_TAB = 'CLOSE_TAB'
const ACTIVATE_TAB = 'ACTIVATE_TAB'
const MOVE_TAB = 'MOVE_TAB'

export const newTab = (filepath) => ({
  type: NEW_TAB,
  filepath
})

export const closeTab = (index) => ({
  type: CLOSE_TAB,
  index
})

export const activateTab = (index) => ({
  type: ACTIVATE_TAB,
  index
})

export const moveTab = (oldIndex, newIndex) => ({
  type: MOVE_TAB,
  oldIndex,
  newIndex
})

const onTabCreate = (state, {filepath}) => {
  // Make all tabs inactive, except a tab for the file to open
  // if it already exists.
  const openFiles = state.openFiles.map(x => {
    return Object.freeze({...x, active: x.filepath === filepath})
  })
  // If no tab for the file exists, insert one to the right of the active tab.
  // (For now, disallow opening multiple instances of the same file.)
  let i = state.openFiles.findIndex(x => x.filepath === filepath)
  if (i === -1) {
    const activeTab = state.openFiles.findIndex(item => item.active)
    openFiles.splice(activeTab + 1, 0, Object.freeze({
      filepath,
      scrollPosition: 0,
      active: true
    }))
  }
  return Object.freeze({
    ...state,
    openFiles: Object.freeze(openFiles)
  })
}

const onTabClick = (state, {index}) => {
  const openFiles = state.openFiles.map((x, i) => {
    return Object.freeze({...x, active: i === index})
  })
  return Object.freeze({
    ...state,
    openFiles: Object.freeze(openFiles)
  })
}

const onTabClose = (state, {index}) => {
  if (index >= state.openFiles.length) return state
  const openFiles = state.openFiles.map((x, i) => {
    return Object.freeze({...x, active: i === Math.max(0, index - 1)})
  })
  openFiles.splice(index, 1)
  return Object.freeze({
    ...state,
    openFiles: Object.freeze(openFiles)
  })
}

const onTabReorder = (state, {oldIndex, newIndex}) => {
  const openFiles = arrayMove(state.openFiles, oldIndex, newIndex)
  return Object.freeze({
    ...state,
    openFiles: Object.freeze(openFiles)
  })
}

const initialState = Object.freeze({
  openFiles: [
    {
      filepath: '/nde/README.md',
      scrollPosition: 0,
      active: true
    },
    {
      filepath: '/nde/index.js',
      scrollPosition: 0,
      active: false
    },
    {
      filepath: '/nde/components/App.js',
      scrollPosition: 0,
      active: false
    },
    {
      filepath: '/nde/components/store.js',
      scrollPosition: 0,
      active: false
    }
  ]
})

function tabreducer (state = initialState, action) {
  switch (action.type) {
  case NEW_TAB:
    return onTabCreate(state, action)
  case CLOSE_TAB:
    return onTabClose(state, action)
  case ACTIVATE_TAB:
    return onTabClick(state, action)
  case MOVE_TAB:
    return onTabReorder(state, action)
  default:
    return state
  }
}

// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
export const store = createStore(tabreducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
