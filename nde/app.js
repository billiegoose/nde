import 'babel-polyfill'
// Hot Module Reload patch
import { module } from '@hot'
// import { AppContainer } from 'react-hot-loader'

// Global CSS
import 'https://golden-layout.com/assets/css/goldenlayout-base.css'
import 'https://golden-layout.com/assets/css/goldenlayout-dark-theme.css'
import './react-contextmenu.css'

// Libraries
import React from 'react'
import ReactDOM from 'react-dom'
import GoldenLayout from 'golden-layout'
window.React = React
window.ReactDOM = ReactDOM
window.GoldenLayout = GoldenLayout

import fs, {fsReady} from 'fs'
import path from 'path'

// Application code
import './app.css'
import TryComponent from './TryComponent.js'
// import MarkdownViewer from './MarkdownViewer.js'
// import EditableTextFile from './EditableTextFile.js'
// import FileNavigator from './FileNavigator/FileNavigator.js'

let MotherLayout = null

// Hot reload case
if (module) {
  console.log('Hot Module! =', module.savedState)
  MotherLayout = new GoldenLayout(module.savedState)
} else {
  // Setup
  MotherLayout = new GoldenLayout({
    content: [{
      type: 'row',
      content: [{
        type:'react-component',
        component: 'TryComponent',
        props: {
          tryComponentFilepath: './nde/FileNavigator/FileNavigator.js'
        }
      },{
        type:'react-component',
        component: 'TryComponent',
        props: {
          tryComponentFilepath: './nde/EditableTextFile.js',
          filepath: 'nde/MarkdownViewer.js'
        }
      },{
        type:'react-component',
        component: 'TryComponent',
        props: {
          tryComponentFilepath: './nde/MarkdownViewer.js',
          filepath: 'nde/README.md'
        }
      }]
    }]
  });
}

MotherLayout.registerComponent('TryComponent', TryComponent);

fsReady.then(() => {
  MotherLayout.init();
})
window.MotherLayout = MotherLayout

export let savedState = null

export const __unload = () => {
  // saving state
  console.log('Saving state...')
  savedState = MotherLayout.toConfig()
  console.log('Teardown...')
  MotherLayout.destroy()
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


if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/service-worker.js')
}