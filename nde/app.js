import 'babel-polyfill'
// Hot Module Reload patch
import { module } from '@hot'
// import { AppContainer } from 'react-hot-loader'

// Global CSS
import './react-contextmenu.css'
import './app.css'

// Libraries
import EventEmitter from 'eventemitter3'
import React from 'react'
import ReactDOM from 'react-dom'
window.React = React
window.ReactDOM = ReactDOM

import fs, {fsReady} from 'fs'
import path from 'path'

// Application code
import LayoutCodePreview from './LayoutCodePreview.js'
import git from 'isomorphic-git'
window.git = git
console.log('git =', git)

let EventHub = new EventEmitter
window.EventHub = EventHub

// Hot reload case
if (module) {
  console.log('Hot Module! =', module.savedState)
} else {
}

fsReady.then(() => {
  ReactDOM.render(<LayoutCodePreview/>, document.getElementById('app'))
})

export let savedState = null

export const __unload = () => {
  // saving state
  console.log('Saving state...')
  console.log('Teardown...')
  // Unsubscribe from filesystem events
  fs.Events.off('change', onChange)
}

// Listen for files that we need to hot-reload when saved.
let base
System.resolve('/').then(here => base = here)

const onChange = ({filename}) => {
  let file = path.join(base, filename)
  console.log(file + ' file changed')
  if (file in System.loads) {
    console.log('Reloading!')
    System.reload(file)
  }
}
fs.Events.on('change', onChange)
