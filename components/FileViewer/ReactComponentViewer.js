import React from 'react'
import fs from 'fs'

export default class ReactComponentViewer extends React.Component {
  constructor () {
    super()
    this.state = {}
  }
  componentDidMount () {
    this.load()
    const listener = (file) => {
      console.log('HEY MAYBE I SHOULD RELOAD?')
      if (this.props.filepath === file) {
        console.log('YES, I SHALL TRY TO RELOAD')
        this.load()
      }
    }
    fs.Events.on('reload', listener)
    this.setState(state => {
      state.listener = listener
      return state
    })
  }
  componentWillUnmount () {
    fs.Events.off('reload', this.state.listener)
  }
  load () {
    import(this.props.filepath)
      .then(mod => {
        let keys = Object.keys(mod)
        console.log('*********************** keys =', keys)
        this.setState(state => {
          if (mod.default) {
            console.log('Using "default" export')
            state.CurrentComponent = mod.default
          } else if (keys.length === 1) {
            console.log(`Using "${keys[0]}" export`)
            state.CurrentComponent = mod[keys[0]]
          } else if (keys.length === 0) {
            throw new Error(`Expected 1 or more exports but no exports found. In file ${this.props.filepath}`)
          } else {
            throw new Error(`TODO: For modules with multiple exports\nshow all of them or show a <select> picker.`)
          }
          return state
        })
      }).catch(err => {
        console.log(err)
        // This is a hack to get the async error to bubble to the parent ErrorBoundary
        this.setState(state => {
          throw new Error(`Unable to load component file ${this.props.filepath}`)
        })
      })
  }
  render () {
    const CurrentComponent = this.state.CurrentComponent
    const jawn = CurrentComponent ? <CurrentComponent/> : ''
    return <article>{jawn}</article>
  }
}
