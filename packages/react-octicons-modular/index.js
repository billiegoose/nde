import React from 'react'
import 'octicons-modular/lib/main.css'

export default class Octicon extends React.Component {
  constructor ({name}) {
    super()
    this.state = {
      svg: ''
    }
    System.import(`octicons-modular/lib/icons/${name}`).then(M => {
      this.setState({svg: M.svg({class: 'valign-middle'})})
    })
  }
  render () {
    return (<span className={'icon ' + this.props.className} dangerouslySetInnerHTML={{__html: this.state.svg}} style={this.props.style}/>)
  }
}
