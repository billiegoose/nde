export class State {
  constructor (init) {
    // freeze old state. (Todo: deep freeze?)
    Object.freeze(init)
    // Copy properties over to new state
    Object.assign(this, init)
  }
}