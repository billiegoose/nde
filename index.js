import 'babel-polyfill'
// Hot Module Reload patch
import { module } from '@hot'
// import { AppContainer } from 'react-hot-loader'

// Global CSS
import './index.css'

// Libraries
import EventEmitter from 'eventemitter3'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import fs, {fsReady} from 'fs'

// Application code
import App from './components/App.js'
import { store } from './components/store.js'

console.log('STORE =', store)

// Global variables
window.React = React
window.ReactDOM = ReactDOM
let EventHub = new EventEmitter()
window.EventHub = EventHub

// Hot reload case
if (module) {
  console.log('Hot Module! =', module.savedState)
} else {
}

fsReady.then(() => {
  ReactDOM.render(
    <Provider store={store}>
      <App/>
    </Provider>,
    document.getElementById('app')
  )
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
System.resolve('/').then(here => {
  base = here
  console.log('BASE =', base)
})

const onChange = ({filename}) => {
  // Hack to work around the extra '/' everywhere.
  let file = new URL(base)
  file.pathname = filename
  file = file.href
  console.log(file + ' file changed')
  if (file in System.loads) {
    console.log('Reloading!')
    System.reload(file).then(() => {
      fs.Events.emit('reload', filename)
    })
  }
}
fs.Events.on('change', onChange)
