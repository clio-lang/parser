const patterns = require("./patterns")

const zip = (left, right) =>
  left.map((item, index) => [item, right[index]])

const zipSelf = array =>
  zip(array, array.slice(1)).slice(0, -1)

const tokenize = async string => {
  const tokens = []
  let index = 0
  mainloop: while (index < string.length) {
    for (let name in patterns) {
      const pattern = patterns[name]
      const match = string.slice(index).match(pattern)
      if (match != null) {
        const raw = match[0]
        tokens.push({ name, index, raw })
        index += raw.length
        continue mainloop
      }
    }
    throw `Lexing error at ${index}`
  }
  return tokens
}

const removeEmptyLines = tokens =>
  tokens.filter(token => token.name != 'emptyline')

const removeComments = tokens =>
  tokens.filter(token => token.name != 'comment')

const brackets = [
  { start: 'lbra', end: 'rbra' },
  { start: 'lcbr', end: 'rcbr' },
  { start: 'lpar', end: 'rpar' },
]

const filterWhites = tokens => {
  for (const { start, end } of brackets) {
    const result = []
    let level = 0
    for (const token of tokens) {
      const { name } = token
      if (name == start) level++
      else if (name == end) level--
      if (!whitespaces.includes(name) || level == 0) {
        result.push(token)
      }
    }
    tokens = result
  }
  return tokens
}

const insertIndents = tokens => {
  const result = [tokens[0]]
  const zipped = zipSelf(tokens)
  let indentLevel = 0
  for (const [left, right] of zipped) {
    if (left.name == 'newline' && right.name == 'space') {
      const dent = indentLevel > right.raw.length ? 'dedent' : 'indent'
      const token = { name: dent, raw: dent, index: right.index }
      result.push(token)
      indentLevel = right.raw.length
    } else if (left.name == 'newline' && right.name != 'space') {
      const token = { name: 'dedent', raw: 'dedent', index: right.index }
      result.push(token)
      indentLevel = 0
    }
    result.push(right)
  }
  return result
}

const insertExtras = tokens => {
  const result = [tokens[0]]
  const zipped = zipSelf(tokens)
  for (const [left, right] of zipped) {
    if (left.name == 'rbra' && right.name == 'lbra') {
      const token = { name: 'slicer', raw: 'slicer', index: right.index }
      result.push(token)
    }
    result.push(right)
  }
  return result
}

const whitespaces = ["space", "newline"]

const removeWhites = tokens =>
  tokens.filter(token => !whitespaces.includes(token.name))

const addEOF = tokens => {
  const { index } = tokens[tokens.length - 1]
  return [...tokens, { name: "eof", raw: "eof", index }]
}

const lexer = string =>
  tokenize(string)
    .then(addEOF)
    .then(removeEmptyLines)
    .then(removeComments)
    .then(filterWhites)
    .then(insertIndents)
    .then(insertExtras)
    .then(removeWhites)

module.exports = lexer;
