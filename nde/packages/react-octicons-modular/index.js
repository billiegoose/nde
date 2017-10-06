import React from 'react'
import 'octicons-modular/main.css'

export default class Octicon extends React.Component {
  constructor ({name}) {
    super()
    this.state = {
      svg: ''
    }
    System.import(`octicons-modular/icons/${name}`).then( M => {
      this.setState({svg: M.svg({class: 'valign-middle'})})
    })
  }
  render () {
    return (<span className="icon" dangerouslySetInnerHTML={{__html: this.state.svg}} />)
  }
}