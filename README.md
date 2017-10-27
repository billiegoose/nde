# \*\*\*Work In Progress\*\*\*

# The IDE of the future, today! [nde.now.sh](https://nde.now.sh)

It is a next-generation development environment for modern JavaScript developers: editor, bundler, and browser all in one.

## Features

 - zero install - works completely in the browser
 - loads modules directly from https://unpkg.com (works for some modules anyway)
 - built in Babel code compiler with JSX support
 - import stylesheets like in Webpack with built in CSS loader
 - hot module reloading (works but needs improvement)
 - save your work directly to Github (works in the console, still working on GUI)
 - caches everything locally so you can still work offline

## Status

The IDE is a collection of React components. So far I have built:

- a file navigator (still under heavy contstruction)
- a file editor (was using Ace, now uses Monaco)
- a file previewer (only Markdown at the moment)

Most of my work currently focuses on the git integration and file browser component.

Milestone reached! The IDE can be used to edit itself!

## Next steps:

- [ ] Add menu item for removing a file from the git index
- [ ] Add a menu item to view the file diff with Monaco
- [ ] Add a UI for signing in with Github and creating an OpenPGP key
- [ ] Finish filesystem wrapper to enable file watching
- [ ] Make the EditableTextFile's ContextMenu customizable per file type
- [ ] Trigger Hot Module reload on file save
- [ ] Build in a Getting Started or walkthrough tutorial
