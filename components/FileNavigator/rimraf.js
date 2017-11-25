import fs from 'fs'
import pify from 'pify'

// It's elegant in its naivety
export async function rimraf (path) {
  try {
    // First assume path is itself a file
    await pify(fs.unlink)(path)
    // if that worked we're done
    return
  } catch (err) {
    // Otherwise, path must be a directory
    if (err.code !== 'EISDIR') throw err
  }
  // Knowing path is a directory,
  // first, assume everything inside path is a file.
  let files = await pify(fs.readdir)(path)
  for (let file of files) {
    let child = path + '/' + file
    try {
      await pify(fs.unlink)(child)
    } catch (err) {
      if (err.code !== 'EISDIR') throw err
    }
  }
  // Assume what's left are directories and recurse.
  let dirs = await pify(fs.readdir)(path)
  for (let dir of dirs) {
    let child = path + '/' + dir
    await rimraf(child)
  }
  // Finally, delete the empty directory
  await pify(fs.rmdir)(path)
}
