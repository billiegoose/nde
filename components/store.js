import { createStore } from 'redux'
import undoable, { ActionCreators } from 'redux-undo'
import { insert, move, without, replace } from 'typescript-array-utils'
import { State } from './State'

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

export const undo = () => ActionCreators.undo()

export const redo = () => ActionCreators.redo()

const onTabCreate = (state, {filepath}) => {
  const newState = new State(state)
  newState.activeFilepath = filepath
  newState.openFiles = state.openFiles
  // If no tab for the file exists, insert one to the right of the active tab.
  // (For now, disallow opening multiple instances of the same file.)
  let i = state.openFiles.findIndex(x => x.filepath === filepath)
  if (i === -1) {
    const activeIndex = state.openFiles.findIndex(item => item.filepath === state.activeFilepath)
    newState.openFiles = insert(state.openFiles, activeIndex + 1, Object.freeze({
      filepath,
      scrollPosition: 0
    }))
  }
  return newState
}

const onTabClick = (state, {filepath}) => {
  const newState = new State(state)
  newState.activeFilepath = filepath
  return newState
}

const onTabClose = (state, {filepath}) => {
  const newState = new State(state)
  let index = state.openFiles.findIndex((x, i) => x.filepath === filepath)
  newState.openFiles = without(state.openFiles, index)
  const newActiveIndex = Math.min(newState.openFiles.length - 1, index)
  newState.activeFilepath = newState.openFiles.length > 0 ? newState.openFiles[newActiveIndex].filepath : undefined
  return newState
}

const onTabReorder = (state, {oldIndex, newIndex}) => {
  const newState = new State(state)
  newState.openFiles = move(state.openFiles, oldIndex, newIndex)
  return newState
}

const initialState = new State({
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
export const store = createStore(undoable(tabreducer, {initialState}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
