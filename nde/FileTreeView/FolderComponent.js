import React from 'react'
import FolderIcon from './FolderIcon.js'

class FolderComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      open: false
    }
  }
  toggle () {
    this.setState((state, props) => ({
      open: !state.open
    }))
  }
  render () {
    let {filename, children, ...props} = this.props
    return (
      <li {...props}>
        <label>
          <a target="#" onClick={this.toggle.bind(this)}>
            <FolderIcon open={this.state.open}/>
            {filename}
          </a>
        </label>
        <ul>
          {this.state.open ? children : ''}
        </ul>
      </li>
    )
  }
}
export default FolderComponent