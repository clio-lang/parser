const { bean, beef } = require('bean-parser')
// DEBUG
const fs = require("fs")
const lexer = require("./lexer.js")

const source = fs.readFileSync("./test.clio", { encoding: "utf8" })
const clioModel = fs.readFileSync("./clio.beef", { encoding: "utf8" })

const model = beef(clioModel)
const parse = tokens => bean(model, tokens)

lexer(source).then(parse)
  .then(results => {
    console.dir({ results }, { depth: null })
  })