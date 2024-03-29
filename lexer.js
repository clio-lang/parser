const patterns = require("./patterns");

const zip = (left, right) => left.map((item, index) => [item, right[index]]);

const zipSelf = array => zip(array, array.slice(1)).slice(0, -1);

const tokenize = async string => {
  const tokens = [];
  let index = 0;
  mainloop: while (index < string.length) {
    for (let name in patterns) {
      const pattern = patterns[name];
      const match = string.slice(index).match(pattern);
      if (match != null) {
        const raw = match[0];
        tokens.push({ name, index, raw });
        index += raw.length;
        continue mainloop;
      }
    }
    throw `Lexing error at ${index}`;
  }
  return tokens;
};

const removeEmptyLines = tokens =>
  tokens.filter(token => token.name != "emptyline");

const removeComments = tokens =>
  tokens.filter(token => token.name != "comment");

const brackets = [
  { start: "lbra", end: "rbra" },
  { start: "lcbr", end: "rcbr" },
  { start: "lpar", end: "rpar" }
];

const filterWhites = tokens => {
  for (const { start, end } of brackets) {
    const result = [];
    let level = 0;
    for (const token of tokens) {
      const { name } = token;
      if (name == start) level++;
      else if (name == end) level--;
      if (!whitespaces.includes(name) || level == 0) {
        result.push(token);
      }
    }
    tokens = result;
  }
  return tokens;
};

const flowTokens = ["pipe", "map", "set"];

const insertIndents = tokens => {
  const result = tokens.slice(0, 1);
  let indentLevel = 0;
  let indentCount = 0;
  for (const index in tokens.slice(0, -2)) {
    const [left, middle, right] = tokens.slice(index, index + 3);
    if (
      left.name == "newline" &&
      middle.name == "space" &&
      middle.raw.length != indentLevel
    ) {
      const dent = indentLevel > middle.raw.length ? "dedent" : "indent";
      if (dent != "indent" || !flowTokens.includes(right.name)) {
        const token = { name: dent, raw: dent, index: middle.index };
        result.push(token);
        indentLevel = middle.raw.length;
        indentCount += dent == "indent" ? 1 : -1;
      }
    } else if (
      left.name == "newline" &&
      middle.name != "space" &&
      indentLevel > 0
    ) {
      while (indentCount) {
        const token = { name: "dedent", raw: "dedent", index: middle.index };
        result.push(token);
        indentCount--;
      }
      indentLevel = 0;
    }
    result.push(middle);
  }
  const eof = tokens.pop();
  while (indentCount) {
    const token = { name: "dedent", raw: "dedent", index: eof.index };
    result.push(token);
    indentCount--;
  }
  result.push(eof);
  return result;
};

const insertSlicers = tokens => {
  const result = [tokens[0]];
  const zipped = zipSelf(tokens);
  for (const [left, right] of zipped) {
    if (left.name == "rbra" && right.name == "lbra") {
      const token = { name: "slicer", raw: "slicer", index: right.index };
      result.push(token);
    }
    result.push(right);
  }
  return result;
};

const pipes = ["map", "pipe"];
const flowEnd = { name: "flow_end", raw: "flow_end" };
const flowEnders = ["newline", "set"];

const insertFlowEnds = tokens => {
  const result = [];
  let isFlow = false;
  for (const token of tokens) {
    const { name, index } = token;
    if (pipes.includes(name)) {
      if (isFlow) result.push({ ...flowEnd, index });
      isFlow = true;
    } else if (flowEnders.includes(name) && isFlow) {
      isFlow = false;
      result.push({ ...flowEnd, index });
    } else if ("colon" == name) {
      isFlow = false;
    }
    result.push(token);
  }
  return result;
};

const decoratorEnd = { name: "decorator_end", raw: "decorator_end" };

const insertDecoratorEnds = tokens => {
  const result = [tokens[0]];
  const zipped = zipSelf(tokens);
  let isDecorator = false;
  for (const [left, right] of zipped) {
    if (left.name == "at" && right.name == "symbol") {
      isDecorator = true;
    } else if (right.name == "newline" && isDecorator) {
      const { index } = right;
      result.push({ ...decoratorEnd, index });
      isDecorator = false;
    }
    result.push(right);
  }
  return result;
};

const whitespaces = ["space", "newline"];

const removeWhites = tokens =>
  tokens.filter(token => !whitespaces.includes(token.name));

const addEOF = tokens => {
  const { index } = tokens[tokens.length - 1];
  return [...tokens, { name: "eof", raw: "eof", index }];
};

const lexer = string =>
  tokenize(string)
    .then(addEOF)
    .then(removeEmptyLines)
    .then(removeComments)
    .then(filterWhites)
    .then(insertIndents)
    .then(insertSlicers)
    .then(insertFlowEnds)
    .then(insertDecoratorEnds)
    .then(removeWhites);

module.exports = lexer;
