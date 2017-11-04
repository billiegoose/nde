import React from 'react'

export default function wrapWithErrorBoundary (WrappedComponent) {
  class TryComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null, errorInfo: null };
    }
    
    componentDidCatch(error, errorInfo) {
      // Catch errors in any components below and re-render with error message
      this.setState({
        error: error,
        errorInfo: errorInfo
      })
      // You can also log error messages to an error reporting service here
    }
    
    render() {
      // If an error, display the error.
      if (this.state.errorInfo) {
        return (
          <div style={{ color: 'red', border: '1px dashed red', padding: '1em' }}>
            <details style={{ whiteSpace: 'pre' }}>
              <summary>
              {this.state.error && this.state.error.toString()}
              </summary>
              {this.state.errorInfo.componentStack}
            </details>
          </div>
        );
      }
      // Otherwise render WrappedComponent normally
      return <WrappedComponent {...this.props}>{this.props.children}</WrappedComponent>;
    }
  }
  TryComponent.displayName = `Try(${WrappedComponent.displayName || WrappedComponent.name || 'Unnamed Component'})`
  return TryComponent
}