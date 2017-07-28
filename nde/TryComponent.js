import React from 'react'
import ErrorDisplay from './ErrorDisplay'

export default class TryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wrappedComponent: null,
      headline: null,
      error: null,
      errorInfo: null
    };
  }
  
  componentWillMount () {
    System.load(this.props.tryComponentFilepath)
    .then(wrappedComponent => {
      if (typeof wrappedComponent.default === 'undefined') {
        throw new Error('The module loaded successfully but there was no default export.')
      }
      this.setState(() => ({ wrappedComponent: wrappedComponent.default }))
    })
    .catch(err => this.setState(() => ({
      headline: `System.load: ${this.props.tryComponentFilepath}`,
      error: err
    })))
  }
  
  componentDidCatch(error, errorInfo) {
    console.log('error, errorInfo =', error, errorInfo)
    this.setState({
      headline: 'React Caught Error',
      error: error,
      errorInfo: errorInfo
    })
  }
  
  render() {
    // If an error, display the error.
    if (this.state.error) {
      return (
        <ErrorDisplay
          headline={this.state.headline}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      )
    }
    let WrappedComponent = this.state.wrappedComponent
    // If wrapped component is still loading, display a loading message.
    if (WrappedComponent === null) {
      return <div style={{color: 'white'}}><i>Loading {this.props.tryComponentFilepath}...</i></div>
    }
    // Otherwise render WrappedComponent normally
    let {tryComponentFilepath, ...props} = this.props
    return <WrappedComponent {...props}></WrappedComponent>
    // try {
      // return React.createElement(
      //   this.state.wrappedComponent,
      //   props,
      //   this.props.children
      // )
    // } catch (err) {
    //   console.log('err =', err)
    //   this.setState({
    //     headline: 'try/catch in render function',
    //     error: err.toString,
    //     errorInfo: {
    //       stack: err.stack
    //     }
    //   })
    //   return <ErrorDisplay headline={this.state.headline} error={this.state.error} stack={this.state.stack}/>
    // }
  }
}