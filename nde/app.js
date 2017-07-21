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
import FileTreeView from './FileTreeView/FileTreeView.js'
import FileTreeData from '../index.json'

let MotherLayout = null

const onClick = ({filepath, id}) => {
  console.log('HEY HEY HEY')
  console.log(filepath, id)
  MotherLayout.createDragSource(document.getElementById(id), {
    type:'react-component',
    component: 'EditableTextFile',
    props: { filepath: filepath }
  })
}

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
        component: 'FileTreeView',
        props: { data: FileTreeData, onClick: onClick }
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
MotherLayout.registerComponent('FileTreeView', FileTreeView);
MotherLayout.init();


export let savedState = null

export const __unload = () => {
  // saving state
  console.log('Saving state...')
  savedState = MotherLayout.toConfig()
  console.log('Teardown...')
  MotherLayout.destroy()
}
