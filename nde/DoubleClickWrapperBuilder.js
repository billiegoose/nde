import React from 'react'
import ReactDOM from 'react-dom'

// Wrap the Component with our application-specific behavior.
export default function ({goldenLayoutInstance, Component}) {
  // Return our wrapped component
  class DoubleClickWrapper extends React.Component {
    doubleclick = () => {
      goldenLayoutInstance.root.getItemsByType('stack')[0].addChild({
        type:'react-component',
        component: 'EditableTextFile',
        props: { filepath: this.props.filepath }
      })
    }
    render () {
      return (
        <Component onDoubleClick={this.doubleclick} {...this.props}></Component>
      );
    }
  }
  return DoubleClickWrapper
}