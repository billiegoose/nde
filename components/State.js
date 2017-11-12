import deepFreeze from 'deep-freeze'

export class State {
  constructor (init) {
    // deep freeze old state so we can catch accidental mutations
    // (TODO: optionally disable in production?)
    deepFreeze(init)
    // Copy properties over to new state
    Object.assign(this, init)
  }
}