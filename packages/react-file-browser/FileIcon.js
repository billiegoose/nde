import 'file-icons-js/css/style.css'
import icons from 'file-icons-js'

export default function FileIcon ({filename, style}) {
  let className = 'icon ' + (icons.getClassWithColor(filename) || 'default-icon')
  return <i className={className} style={style}></i>
}
