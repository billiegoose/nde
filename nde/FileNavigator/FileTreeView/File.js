import FileIcon from './FileIcon.js'

export default function File ({filename, ...props}) {
  let {filepath, root, statedata, FolderComponent, FileComponent, glEventHub, glContainer, ...props2} = props
  return (
    <label {...props2}>
      <a target="#">
        <FileIcon filename={filename}></FileIcon>
        {filename}
      </a>
    </label>
  )
}