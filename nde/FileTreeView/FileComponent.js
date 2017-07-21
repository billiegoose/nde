import icons from 'file-icons-js'

const FileComponent = ({filename, onClick, onDoubleClick, cuid}) => {
  let className = 'icon ' + icons.getClassWithColor(filename);
  return (
    <li id={cuid}>
      <label>
        <a target="#" onClick={onClick} onDoubleClick={onDoubleClick}>
          <i className={className}></i>
          {filename}
        </a>
      </label>
    </li>
  )
}
export default FileComponent