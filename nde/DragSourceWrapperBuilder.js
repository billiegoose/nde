import React from 'react'
import ReactDOM from 'react-dom'

// Wrap the Component with our application-specific behavior.
export default function ({goldenLayoutInstance, Component}) {
  // Return our wrapped component
  class DragSourceWrapper extends React.Component {
    componentDidMount () {
      goldenLayoutInstance.createDragSource(ReactDOM.findDOMNode(this), {
        type:'react-component',
        component: 'EditableTextFile',
        props: { filepath: this.props.filepath }
      })
    }
    componentWillUnmount () {
      // Placeholder for cleanup code if I discover that's necessary
    }
    
    render () {
      return (
        <Component {...this.props}></Component>
      );
    }
  }
  return DragSourceWrapper
}