class Scope {
  constructor(outerScope) {
    this.outerScope = outerScope
    this.scope = {}
  }
  get(key) {
    if (key in this.scope) {
      return this.scope[key]
    } else if (this.outerScope) {
      return this.outerScope.get(key)
    } else {
      throw 'Not defined'
    }
  }
  set(key, value) {
    this.scope[key] = value
    return value
  }
  extend(object) {
    Object.assign(this.scope, object)
  }
}

const scope = outerScope => new Scope(outerScope)

module.exports = { scope, Scope }