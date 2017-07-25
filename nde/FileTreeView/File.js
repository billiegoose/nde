import 'file-icons-js/css/style.css'
import icons from 'file-icons-js'

const File = ({filename, ...props}) => {
  let className = 'icon ' + icons.getClassWithColor(filename);
  return (
    <li {...props}>
      <label>
        <a target="#">
          <i className={className}></i>
          {filename}
        </a>
      </label>
    </li>
  )
}
export default File