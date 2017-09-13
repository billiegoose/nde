import FileIcon from './FileIcon.js'

export default function File ({filename, domProps, children}) {
  return (
    <label {...domProps}>
      <a target="#">
        <FileIcon filename={filename}></FileIcon>
        {filename}
        {children}
      </a>
    </label>
  )
}