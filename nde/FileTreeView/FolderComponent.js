import cuid from 'cuid'
import FolderIcon from './FolderIcon.js'

const FolderComponent = ({filename, children}) => {
  let id = cuid();
  return (
    <li>
      <input type="checkbox" name={id} id={id}/>
      <label htmlFor={id}>
        <a target="#">
          <FolderIcon/>
          {filename}
        </a>
      </label>
      <ul>
        {children}
      </ul>
    </li>
  )
}
export default FolderComponent