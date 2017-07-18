// Step 1. Setup BrowserFS
import BrowserFS from 'browserfs'
BrowserFS.install(window)
var lsfs = new BrowserFS.FileSystem.LocalStorage();
// Initialize it as the root file system.
BrowserFS.initialize(lsfs);
// Step 2. Export fs
const fs = BrowserFS.BFSRequire('fs')
export default fs
console.log('fs =', fs)
// Step 3. Make SystemJS alias 'fs' to this module.
if (System.paths['fs'] === undefined) {
  System.config({paths: {'fs': './builtins/fs.js'}})
}
