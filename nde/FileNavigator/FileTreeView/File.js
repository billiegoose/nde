import 'file-icons-js/css/style.css'
import icons from 'file-icons-js'

export default function File ({filename, ...props}) {
  let className = 'icon ' + (icons.getClassWithColor(filename) || 'default-icon');
  let {filepath, root, statedata, FolderComponent, FileComponent, glEventHub, glContainer, ...props2} = props
  return (
    <label {...props2}>
      <a target="#">
        <i className={className}></i>
        {filename}
      </a>
    </label>
  )
}