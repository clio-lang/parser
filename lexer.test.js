const fs = require("fs");

const lexer = require("./lexer");
const testfile = fs.readFileSync("./test.clio").toString();
test("Lexed tokens are stored in array", done => {
  lexer(testfile).then(output => {
    expect(Array.isArray(output)).toBeTruthy();
    done();
  });
});
