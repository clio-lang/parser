const { parser } = require('./parser')

const fs = require("fs")
const source = fs.readFileSync("./test.clio", { encoding: "utf8" })

const rules = {
  clio(cst, generate) {
    console.log(cst);
  }
}

const generate = cst => rules[cst.name](cst, generate)
const generator = src => parser(src).then(generate)

generator(source).catch(error => console.log(error))

module.exports = { generate, generator }
