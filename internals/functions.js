const uuidv4 = require('uuid/v4')
const { Scope } = require('./scope')

class Fn {
  constructor(fn, outerScope) {
    this.id = uuidv4()
    this.fn = fn
    this.outerScope = outerScope
  }
  call(...args) {
    const scope = new Scope(this.outerScope)
    return this.fn(scope, ...args)
  }
}

const fn = (fn, outerScope) => new Fn(fn, outerScope)

module.exports = { fn, Fn }