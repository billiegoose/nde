import FileTreeViewBuilder from './FileTreeViewBuilder'
import FileComponent from './FileComponent'
import FolderComponent from './FolderComponent'
const FileTreeViewBasic = FileTreeViewBuilder({
  FolderComponent,
  FileComponent
});
export default FileTreeViewBasic