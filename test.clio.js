function test(a, b) {
  function another(c) {
    a + (b + c);
  }
  another;
}

const foo = decor(
  function foo(a, b) {
    Math.pow(a, 2) + 4 * b;
  },
  1,
  2
);

mirror(1)
  .then(result => add(result, 2))
  .then(result => set("myVar", scope, result));

mirror([1, 2, 3])
  .then(result => pow(result, 2))
  .then(result =>
    (function (n) {
      n * 2;
    })(result)
  )
  .then(result =>
    (function (n) {
      mirror(n + 4).then(result => set("temp", scope, result));
      temp * 99;
    })(result)
  )
  .then(result => add(result, 1))
  .then(result => set("final", scope, result));

if (a > 2) {
  mirror("a > 2").then(result => print(result));
} else if (a < 2) {
  mirror("a < 2").then(result => print(result));
} else {
  mirror("is 2").then(result => print(result));
}

