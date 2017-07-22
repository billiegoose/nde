// Step 1. Setup BrowserFS
import BrowserFS from 'browserfs'
// BrowserFS.install(window)

var ajaxFS = new BrowserFS.FileSystem.XmlHttpRequest();
var localStorageFS = new BrowserFS.FileSystem.LocalStorage();
var overlayFS = new BrowserFS.FileSystem.OverlayFS(localStorageFS, ajaxFS);
var mfs = new BrowserFS.FileSystem.MountableFileSystem();
mfs.mount('/', overlayFS);
mfs.mount('/orig', ajaxFS);
// Initialize it as the root file system.
BrowserFS.initialize(mfs);
// Step 2. Export fs
const fs = BrowserFS.BFSRequire('fs')
window.fs = fs
export default fs
overlayFS.initialize(function () {})