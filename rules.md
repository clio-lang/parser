# Rules

Just some compiler writing rules I wrote for myself.

1. Lexer is not just a tokenizer. It can also do some
   analysis on the tokens, filtering or adding some tokens.

2. It must be clear where a rule ends.

3. If it overcomplicates parsing, we don't want it.