class Flow {
  constructor(scope, data) {
    this.data = data
    this.scope = scope
  }
  pipe(fn, ...args) {
    const data = fn.call(this.data, ...args)
    return new Flow(data)
  }
  map(fn, ...args) {
    const data = this.data.map(item => fn.call(item, ...args))
    return new Flow(data)
  }
  set(key) {
    this.scope[key] = this.data
    return this
  }
}

const flow = (scope, data) => new Flow(scope, data)

module.exports = { flow, Flow }