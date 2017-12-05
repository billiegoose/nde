import { FileIcon } from 'react-file-icons'

export default function File ({filename, domProps, children}) {
  return (
    <label {...domProps}>
      <a target="#" style={{whiteSpace: 'nowrap', position: 'relative'}}>
        <FileIcon filename={filename}></FileIcon>
        {children}
      </a>
    </label>
  )
}
