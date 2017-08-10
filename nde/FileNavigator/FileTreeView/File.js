import FileIcon from './FileIcon.js'

export default function File ({filename, ...props}) {
  let {filepath, root, statedata, FolderComponent, FileComponent, glEventHub, glContainer, ...passedProps} = props
  return (
    <label {...passedProps}>
      <a target="#">
        <FileIcon filename={filename}></FileIcon>
        {filename}
      </a>
    </label>
  )
}