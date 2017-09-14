# The IDE of the future, today! https://nde.now.sh

It is a next-generation development environment for modern JavaScript developers: editor, bundler, and browser all in one.

## Features

 - zero install - works completely in the browser
 - works offline
 - imports modules directly from https://unpkg.com without installing (kind of works?)
 - built in Babel code compiler with JSX support
 - hot module reloading
 - save your work directly to Github (work in progress)

## Status

The IDE can be used to edit itself! It is a collection of React components.

Most of my work currently focuses on the git integration and file browser component.
Once that is done, meaning you can meaningfully save your work, then I will
actually start using it to develop itself and pay more attention to the text editor component.

## Next steps:

- [x] Add a service worker to proxy file requests through BrowserFS.
  - [ ] Use the index.json file to cache all the files on initial page load
  - [x] Cache external dependencies like `unpkg.com` to support working completely offline
  - [x] Modify the SW to use the exact same 'fs' module as the main thread.
- [x] Add a File Tree
  - [x] Populate the file tree using BrowserFS
  - [ ] Add styling to show which files have unsaved changes/saved changes/are unmodified.
- [x] Add git support so we can save work more-permanently like.
  - [ ] Download files from Github rather than from the host site.
  - [ ] Add a way to view diffed changes.
  - [ ] Allow making commits and pushing back to Github.
- [ ] Make the EditableTextFile's ContextMenu customizable per file type.
- [x] Add Ctrl-S key shortcut to save file.
- [ ] Add Ctrl-D key shortcut to do Find and Replace: Select Next
- [x] Add a way to trigger Hot Module Reload.
  - [ ] Trigger Hot Module reload on file save.
- [ ] Build in a Getting Started or walkthrough tutorial.

