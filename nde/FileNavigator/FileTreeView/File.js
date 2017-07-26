import 'file-icons-js/css/style.css'
import icons from 'file-icons-js'

export default function File ({filename, ...props}) {
  let className = 'icon ' + icons.getClassWithColor(filename);
  return (
    <label {...props}>
      <a target="#">
        <i className={className}></i>
        {filename}
      </a>
    </label>
  )
}