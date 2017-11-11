import React from 'react'

export default class ErrorTrap extends React.Component {
  componentDidCatch (error, errorInfo) {
    // Catch errors in any components below and
    // convert the error into an "event" we bubble up to the
    // ErrorBoundary component.
    this.props.onError({
      error: error,
      errorInfo: errorInfo
    })
  }

  render () {
    return this.props.children
  }
}
