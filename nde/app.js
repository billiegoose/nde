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

let myLayout = null

const onClick = ({filepath, id}) => {
  console.log(filepath, id)
  myLayout.createDragSource(document.getElementById(id), {
    type:'react-component',
    component: 'EditableTextFile',
    props: { filepath: filepath }
  })
}

// Setup
myLayout = new GoldenLayout({
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
myLayout.registerComponent('MarkdownViewer', MarkdownViewer);
myLayout.registerComponent('EditableTextFile', EditableTextFile);
myLayout.registerComponent('FileTreeView', FileTreeView);
myLayout.init();

