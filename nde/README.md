# Nde
The next-generation development environment for modern JavaScript developers
(pronounced "indie")

Next steps:

- [x] Add a service worker to proxy file requests through BrowserFS.
  - [ ] Use the index.json file to cache all the files on initial page load
  - [ ] Cache external dependencies like `unpkg.com` to support working completely offline
  - [ ] Modify the SW to use the exact same 'fs' module as the main thread.
- [x] Add a File Tree
  - [x] Populate the file tree using BrowserFS
  - [ ] Add styling to show which files have unsaved changes/saved changes/are unmodified.
- [ ] Add git support so we can save work more-permanently like.
  - [ ] Download files from Github rather than from the host site.
  - [ ] Add a way to view diffed changes.
  - [ ] Allow making commits and pushing back to Github.
- [ ] Make the ExitableTextFile's ContextMenu customizable per file type.
- [x] Add Ctrl-S key shortcut to save file.
- [ ] Add Ctrl-D key shortcut to do Find and Replace: Select Next
- [x] Add a way to trigger Hot Module Reload.
  - [x] Trigger Hot Module reload on file save.

## Note
I used 'npx browserfs index.json' to generate the directory indexes.