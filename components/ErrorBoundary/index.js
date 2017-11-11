import React from 'react'
import ErrorTrap from './ErrorTrap'
import { PrettyError } from './PrettyError'

export default class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: null }
  }

  renderError (error) {
    // Catch errors in any components below and re-render with error message
    this.setState({ error })
  }

  dismissError () {
    // Reset the errored state
    this.setState({
      error: null
    })
  }

  render () {
    if (this.state.error) {
      // If an error, render a pretty error.
      return <PrettyError error={this.state.error} onDismiss={() => this.dismissError()}/>
    } else {
      // Otherwise render children normally
      return <ErrorTrap onError={this.renderError.bind(this)}>{this.props.children}</ErrorTrap>
    }
  }
}
