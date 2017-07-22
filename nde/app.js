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

// Application code
import './app.css'
import MarkdownViewer from './MarkdownViewer.js'
import EditableTextFile from './EditableTextFile.js'
import FileTreeData from '../index.json'
import FileNavigatorBuilder from './FileNavigatorBuilder.js'

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
        component: 'FileNavigator',
        props: { data: FileTreeData}
      },{
        type: 'column',
        content:[{
          type:'react-component',
          component: 'EditableTextFile',
          props: { filepath: 'nde/app.js' }
        },{
          type:'react-component',
          component: 'EditableTextFile',
          props: { filepath: 'nde/EditableTextFile.js' }
        }]
      }, {
        type: 'column',
        content:[{
          type:'react-component',
          component: 'EditableTextFile',
          props: { filepath: 'README.md' }
        },{
          type:'react-component',
          component: 'MarkdownViewer',
          props: { filepath: 'README.md' }
        }]
      },{
        type: 'column',
        content:[{
          type:'react-component',
          component: 'EditableTextFile',
          props: { filepath: 'nde/README.md' }
        },{
          type:'react-component',
          component: 'MarkdownViewer',
          props: { filepath: 'nde/README.md' }
        }]
      }]
    }]
  });
}

MotherLayout.registerComponent('MarkdownViewer', MarkdownViewer);
MotherLayout.registerComponent('EditableTextFile', EditableTextFile);
MotherLayout.registerComponent('FileNavigator', FileNavigatorBuilder(MotherLayout));

MotherLayout.init();
window.MotherLayout = MotherLayout

export let savedState = null

export const __unload = () => {
  // saving state
  console.log('Saving state...')
  savedState = MotherLayout.toConfig()
  console.log('Teardown...')
  MotherLayout.destroy()
}
