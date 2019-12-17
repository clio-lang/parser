const { Fn } = require("./internals/functions");
const { Flow } = require("./internals/flow");
const { Scope } = require("./internals/scope");
const { Array } = require("./internals/array");
const builtins = require("./internals/builtins");

const scope = new Scope(builtins, null);

new Flow(scope, new Array(1, 2, 3))
  .map(scope.mul, 2)
  .map(scope.add, 1)
  .pipe(scope.print);

new Flow(scope, new Array(1, 2, 3))
  .map(scope.mul, 2)
  .map(scope.add, 1)
  .map(scope.print);

