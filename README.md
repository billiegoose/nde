# \*\*\*Work In Progress\*\*\*

# The IDE of the future, today! [nde.now.sh](https://nde.now.sh)

It is a next-generation development environment for modern JavaScript developers: editor, bundler, and browser all in one.

## Features

 - [x] zero install - works completely in the browser
 - [x] built in Git UI for cloning repos, making commits, pushing branches
 - [x] freedom from `npm install` - `import` loads the latest version of a module directly from https://unpkg.com (works for some modules anyway)
 - [x] built in Babel code compiler with JSX support
 - [x] import stylesheets like in Webpack with built in CSS loader
 - [x] caches everything locally so you can still work offline
 - [ ] reload pages on file save w/ hot module reloading
 - [ ] automatic version pinning for modules
 - [ ] built in rollup or jspm to create minified code bundles for production
 - [ ] built in test runner
 - [ ] one-click deploy to Now like on CodeSandbox
 - [ ] multi-user collaborative editing?
 - [ ] P2P goodness?

## Status

The IDE is a collection of React components. So far I have built:

- a file navigator (still under heavy contstruction)
- a file editor (was using Ace, now uses Monaco)
- a file previewer (only Markdown at the moment)

Most of my work currently focuses on the git integration and file browser component.

Milestone reached! The IDE can be used to edit itself!

## Next steps:
- [ ] Support running off hosted Github Pages without having to "install" first
- [ ] Build in a Getting Started or walkthrough tutorial
- [ ] Move state into a Redux store
  - [ ] Add state serialization
  - [ ] Perfect hot module reloading
- [ ] Add a menu item to view the file diff with Monaco
- [ ] Add a UI for signing in with Github and creating an OpenPGP key
- [ ] Finish filesystem wrapper to enable file watching
- [ ] Trigger Hot Module reload on file save
