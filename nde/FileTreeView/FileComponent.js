import icons from 'file-icons-js'

const FileComponent = ({filename, cuid, ...props}) => {
  let className = 'icon ' + icons.getClassWithColor(filename);
  return (
    <li id={cuid} {...props}>
      <label>
        <a target="#">
          <i className={className}></i>
          {filename}
        </a>
      </label>
    </li>
  )
}
export default FileComponent