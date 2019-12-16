const { Fn } = require("./internals/functions");
const { Flow } = require("./internals/flow");
const { Scope } = require("./internals/scope");
const builtins = require("./internals/builtins");

const scope = new Scope(null);
scope.extend(builtins);

new Flow(scope, [1, 2, 3])
  .map(scope.get("mul"), 2)
  .map(scope.get("add"), 1)
  .map(scope.get("print"));

