const { parser } = require('./parser')

const template = generated => `
const { Fn } = require('./internals/functions')
const { Flow } = require('./internals/flow')
const { Scope } = require('./internals/scope')
const builtins = require("./internals/builtins")

const scope = new Scope(null)
scope.extend(builtins)

${generated}
`

const rules = {
  clio(cst, generate) {
    const { body } = cst
    const processedBody = body.map(generate)
    const generated = processedBody.join(';\n\n')
    return template(generated)
  },
  function(cst, generate) {
    const { fn: name, parameters, body: { body } } = cst
    const processedBody = body.map(generate)
    return `scope.set("${name}", new Fn(function ${name} (scope, ${parameters.join(', ')}) {
      ${processedBody.join(';\n')}
    }))`
  },
  anonymous_function(cst, generate) {
    const { parameter, body: expr } = cst
    const processedBody = expr.name == 'block' ?
      expr.body.map(generate).join(';\n') : generate(expr)
    return `new Fn(function (scope, ${parameter}) {
      ${processedBody}
    })`
  },
  math(cst, generate) {
    const { lhs, op, rhs } = cst
    const left = generate(lhs)
    const right = generate(rhs)
    if (op != '^') return `(${left} ${op} ${right})`
    return `Math.pow(${left}, ${right})`
  },
  symbol(cst, generate) {
    const { raw } = cst
    return `scope.get("${raw}")`
  },
  decorated_function(cst, generate) {
    const { fn, decorator } = cst
    const { fn: fnName } = fn
    parsedFn = generate(fn)
    const { fn: { raw: name }, args } = decorator
    const parsedArgs = args.map(generate)
    return `scope.set("${fnName}", ${name}(${parsedFn}, ${parsedArgs.join(', ')}))`
  },
  number(cst, generate) {
    const { raw } = cst
    return raw
  },
  string(cst, generate) {
    const { raw } = cst
    return raw
  },
  flow(cst, generate) {
    const { data, calls } = cst
    const processedData = generate(data)
    const processedCalls = calls.map(generate).join('\n')
    return `new Flow(scope, ${processedData})\n` + processedCalls
  },
  function_call(cst, generate) {
    const { fn, args, map } = cst
    const processedFn = generate(fn)
    const processedArgs = args.map(generate)
    const method = map ? '.map' : '.pipe'
    return `${method}(${processedFn}, ${processedArgs.join(', ')})`
  },
  set_var(cst, generate) {
    const { variable } = cst
    return `.set("${variable}")`
  },
  array(cst, generate) {
    const { items } = cst
    const processedItems = items.map(generate)
    return `[${processedItems.join(', ')}]`
  },
  comparison(cst, generate) {
    const { lhs, cmp, rhs } = cst
    const left = generate(lhs)
    const right = generate(rhs)
    return `(${left} ${cmp} ${right})`
  },
  if_elif_else_conditional(cst, generate) {
    const { if_block, elif_block, else_block } = cst
    const processedIf = generate(if_block)
    const processedElif = generate(elif_block)
    const processedElse = generate(else_block)
    return [processedIf, processedElif, processedElse].join('\n')
  },
  if_conditional(cst, generate) {
    const { condition, body: { body } } = cst
    const processedBody = body.map(generate)
    const processedCondition = generate(condition)
    return `if (${processedCondition}) { ${processedBody.join(';\n')} }`
  },
  elif_conditional(cst, generate) {
    const { body } = cst
    const processedBody = body
      .map(({ condition, body: { body } }) => {
        const processedBody = body.map(generate)
        const processedCondition = generate(condition)
        return { body: processedBody, condition: processedCondition }
      })
      .map(({ condition, body }) => {
        return `else if (${condition}) { ${body.join(';\n')} }`
      })
    return processedBody.join('\n')
  },
  else_conditional(cst, generate) {
    const { body: { body } } = cst
    const processedBody = body.map(generate)
    return `else { ${processedBody.join(';\n')} }`
  }
}

const generate = cst => rules[cst.name](cst, generate)
const generator = src => parser(src).then(generate)

module.exports = { generate, generator }

// DEBUG

const fs = require("fs")
const { format: prettify } = require("prettier");
const source = fs.readFileSync("./test.clio", { encoding: "utf8" })

generator(source)
  .then(js => prettify(js, { parser: "babel" }))
  .then(console.log)
  .catch(error => console.log(error))
