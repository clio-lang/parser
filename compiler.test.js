const compiler = require("./compiler");
test("Compile code", done => {
  compiler.compile("[1 2 3] -> print\n").then(out => {
    expect(typeof out).toBe("string");
    done();
  });
});
