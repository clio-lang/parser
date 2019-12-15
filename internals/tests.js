const { fn } = require('./functions')
const { flow } = require('./flow')
const { scope } = require('./scope')

const outerScope = null
const innerScope = scope(outerScope)

innerScope.set('c', 10)

const add = fn((scope, a, b) => {
  scope.set('d', a + b + scope.get('c'))
  return scope.get('d')
}, innerScope)

const print = fn((scope, ...args) => {
  console.log(...args)
}, innerScope)

flow(scope, 4)
  .pipe(add, 5)
  .pipe(print)

