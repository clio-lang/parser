const { Fn } = require("./internals/functions");
const { Flow } = require("./internals/flow");
const { Scope } = require("./internals/scope");

const scope = new Scope(null);

scope.set(
  "test",
  new Fn(function test(scope, a, b) {
    scope.set(
      "another",
      new Fn(function another(scope, c) {
        scope.get("a") + (scope.get("b") + scope.get("c"));
      })
    );
    scope.get("another");
  })
);

scope.set(
  "foo",
  decor(
    scope.set(
      "foo",
      new Fn(function foo(scope, a, b) {
        Math.pow(scope.get("a"), 2) + 4 * scope.get("b");
      })
    ),
    1,
    2
  )
);

new Flow(scope, 1).pipe(scope.get("add"), 2).set("myVar");

new Flow(scope, [1, 2, 3])
  .pipe(scope.get("pow"), 2)
  .pipe(
    new Fn(function(scope, n) {
      scope.get("n") * 2;
    })
  )
  .pipe(
    new Fn(function(scope, n) {
      new Flow(scope, scope.get("n") + 4).set("temp");
      scope.get("temp") * 99;
    })
  )
  .pipe(scope.get("add"), 1)
  .set("final");

if (scope.get("a") > 2) {
  new Flow(scope, "a > 2").pipe(scope.get("print"));
} else if (scope.get("a") < 2) {
  new Flow(scope, "a < 2").pipe(scope.get("print"));
} else {
  new Flow(scope, "is 2").pipe(scope.get("print"));
}

