# Polish File

Analyse the file at the path given in $ARGUMENTS and do the following — **without adding, removing, or modifying any actual logic or code**.

If no path is given in $ARGUMENTS, determine the file to polish using this priority order:
1. The path from an `<ide_opened_file>` tag in the conversation context (the file currently open in the IDE).
2. The path from an `<ide_selection>` tag if it points to a file.
3. If neither is available, ask the user which file to polish before proceeding.

1. **Analyse** — read and understand the file: its purpose, the functions/classes it defines, control flow, and anything non-obvious about it.

2. **Comment** — add comments only where genuinely needed:
   - A short file-level comment at the top if the file's purpose is not obvious from its name.
   - A one-line comment above each exported function/class explaining *what* it does (not *how*).
   - Inline comments only for non-obvious lines (tricky logic, magic values, workarounds). Do not comment self-explanatory code.
   - Never write multi-line comment blocks. One short line max per comment.

3. **Fix missing semicolons** — insert semicolons where required by the language:
   - For JavaScript/TypeScript: add a `;` at the end of any statement that is missing one (variable declarations, assignments, `return`, `throw`, `break`, `continue`, `import`/`export` statements, and expression statements). Do NOT add semicolons after `}` that closes a block (function bodies, `if`/`for`/`while`, class definitions).
   - Skip this step for languages that do not use semicolons as statement terminators (Python, Go, etc.).

4. **Format for readability** — adjust whitespace and line breaks only:
   - Separate import groups (built-ins / third-party / local) with a blank line.
   - Add a blank line before and after each function/class definition.
   - Add a blank line before `return` statements inside functions that have more than 2 lines above the return.
   - Add a blank line between logically distinct blocks inside a function (e.g. between validation, data prep, and the actual operation).
   - Ensure the file ends with exactly one newline.

5. **Break long lines** — wrap any line that exceeds 100 characters so every line fits on screen without horizontal scrolling:
   - For chained method calls, break before each `.method(` and indent the continuation by 2 spaces relative to the start of the expression.
   - For long function parameter lists (definitions or calls), place each parameter/argument on its own line, indented 2 spaces past the opening `(`, with the closing `)` on its own line aligned with the start of the call.
   - For long object literals, place each key-value pair on its own line with the closing `}` aligned with the opening.
   - For long string concatenations or template literals, break at a `+` operator or use a template literal across multiple lines.
   - For long `import` lists, place each named import on its own line inside `{ }`.
   - For long boolean/comparison conditions in `if`/`while`, break before each `&&` / `||` and indent continuations by 2 spaces.
   - Preserve the original indentation level of the statement — only the wrapped continuation lines get extra indent.
   - Never split a string literal mid-word just to hit the limit; find the nearest logical break point instead.

**Strict rules:**
- Do NOT rename variables, parameters, or functions.
- Do NOT reorder code.
- Do NOT change any expression, condition, or value.
- Do NOT add error handling, logging, or new logic.
- Only edits allowed: adding comment lines, adding/removing blank lines, inserting missing semicolons, and wrapping long lines.

After applying the changes, briefly tell the user what comments were added and what formatting was adjusted.
