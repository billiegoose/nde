import React from 'react'
import FolderIcon from './FolderIcon.js'

class FolderComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      open: false,
      loading: false
    }
  }
  toggle () {
    this.setState({
      open: !this.state.open
    })
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