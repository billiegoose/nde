import React from 'react'
import path from 'path'
// import PropTypes from 'prop-types'

const findDirectChildren = (filepath, filepaths) =>
  filepaths.filter(x => x.length > filepath.length)
    .filter(x => x.startsWith(filepath))
    .filter(x => x.lastIndexOf('/') <= filepath.length)
    .sort()

const getChildren = (filepath, fileMap) => {
  let keys = Object.keys(fileMap)
  let filepaths = findDirectChildren(filepath, keys)
}

export default class FileList extends React.Component {
  // static propTypes = {
  //   filepath: PropTypes.string.isRequired,
  //   fileMap: PropTypes.object.isRequired,
  //   open: PropTypes.bool,
  //   FolderComponent: PropTypes.any.isRequired,
  //   FileComponent: PropTypes.any.isRequired
  // }
  constructor ({open}) {
    super()
    this.state = {
      beLazy: !open
    }
  }
  componentWillReceiveProps ({open}) {
    if (open) {
      this.setState({beLazy: false})
    }
  }
  shouldComponentUpdate (nextProps, nextState) {
    // Here is the optimization
    if (!this.props.open && !nextProps.open)  {
      return false
    }
    // We could continue optimizing by handling the "folder is open" case next.
    return true
  }
  render () {
    if (this.state.beLazy) return ''
    let {filepath, fileMap, open, FolderComponent, FileComponent, ...props} = this.props
    let style = !open ? {display: 'none'} : {}

    let folders = []
    let files = []

    let keys = Object.keys(fileMap)
    let filepaths = findDirectChildren(filepath, keys)

    for (let key of filepaths) {
      if (fileMap[key].type === 'dir') {
        let open = fileMap[key].navOpen
        folders.push(
          <li key={key}>
            <FolderComponent
              filename={path.basename(key)}
              filepath={key}
              fileMap={fileMap}
              open={open}
              {...props}>
            </FolderComponent>
            <FileList
              filepath={key}
              fileMap={fileMap}
              open={open}
              FolderComponent={FolderComponent}
              FileComponent={FileComponent}
              {...props}>
            </FileList>
          </li>
        )
      } else {
        files.push(
          <li key={key}>
            <FileComponent
              filename={path.basename(key)}
              filepath={key}
              fileMap={fileMap}
              {...props}>
            </FileComponent>
          </li>
        )
      }
    }
    let entries = folders.concat(files)
    return (
      <ul style={style}>
        {entries}
      </ul>
    )
  }
}

