import { createStore } from 'redux'
import undoable from 'redux-undo'
import { insert, move, without, replace } from 'typescript-array-utils'

const NEW_TAB = 'OPEN_TAB'
const CLOSE_TAB = 'CLOSE_TAB'
const ACTIVATE_TAB = 'ACTIVATE_TAB'
const MOVE_TAB = 'MOVE_TAB'

export const newTab = (filepath) => ({
  type: NEW_TAB,
  filepath
})

export const closeTab = (filepath) => ({
  type: CLOSE_TAB,
  filepath
})

export const activateTab = (filepath) => ({
  type: ACTIVATE_TAB,
  filepath
})

export const moveTab = (oldIndex, newIndex) => ({
  type: MOVE_TAB,
  oldIndex,
  newIndex
})

const onTabCreate = (state, {filepath}) => {
  const activeFilepath = filepath
  let openFiles = state.openFiles
  // If no tab for the file exists, insert one to the right of the active tab.
  // (For now, disallow opening multiple instances of the same file.)
  let i = state.openFiles.findIndex(x => x.filepath === filepath)
  if (i === -1) {
    const activeIndex = state.openFiles.findIndex(item => item.filepath === state.activeFilepath)
    openFiles = insert(state.openFiles, activeIndex + 1, Object.freeze({
      filepath,
      scrollPosition: 0
    }))
  }
  return Object.freeze({
    ...state,
    activeFilepath,
    openFiles: Object.freeze(openFiles)
  })
}

const onTabClick = (state, {filepath}) => {  
  return Object.freeze({
    ...state,
    activeFilepath: filepath
  })
}

const onTabClose = (state, {filepath}) => {
  let index = state.openFiles.findIndex((x, i) => x.filepath === filepath)
  const openFiles = without(state.openFiles, index)
  const newActiveIndex = Math.min(openFiles.length - 1, index)
  const activeFilepath = openFiles.length > 0 ? openFiles[newActiveIndex].filepath : undefined
  return Object.freeze({
    ...state,
    activeFilepath,
    openFiles: Object.freeze(openFiles)
  })
}

const onTabReorder = (state, {oldIndex, newIndex}) => {
  const openFiles = move(state.openFiles, oldIndex, newIndex)
  return Object.freeze({
    ...state,
    openFiles: Object.freeze(openFiles)
  })
}

const initialState = Object.freeze({
  activeFilepath: '/nde/components/App.js',
  openFiles: [
    {
      filepath: '/nde/README.md',
      scrollPosition: 0
    },
    {
      filepath: '/nde/index.html',
      scrollPosition: 0
    },
    {
      filepath: '/nde/components/App.js',
      scrollPosition: 0
    },
    {
      filepath: '/nde/components/store.js',
      scrollPosition: 0
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
