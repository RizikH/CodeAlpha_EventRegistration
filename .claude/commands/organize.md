# Organize File

Reorganize the methods in the file at the path given in $ARGUMENTS — **without changing any code, logic, or behavior**.

If no path is given in $ARGUMENTS, determine the file to organize using this priority order:
1. The path from an `<ide_opened_file>` tag in the conversation context (the file currently open in the IDE).
2. The path from an `<ide_selection>` tag if it points to a file.
3. If neither is available, ask the user which file to organize before proceeding.

## Steps

1. **Read and understand** — read the entire file. Identify every method/function and what it does.

2. **Group** — mentally cluster the methods into logical groups. Common groupings for this project (Express + PostgreSQL via `pg` pool):
   - Initialization / setup
   - CRUD operations (create, read, update, delete) — these typically wrap raw SQL queries via `db/index.js`
   - Query / search helpers — parameterized SELECT helpers
   - Validation / authorization helpers
   - Data transformation / formatting helpers
   - Export / integration helpers
   Use the actual purpose of the methods to decide — do not force them into a predefined category if it does not fit.

3. **Reorder** — move the methods within the file so that related methods are adjacent. Within each group, order from most general to most specific, or from the natural call order (the method that calls others comes first). Keep any top-level statements (requires, imports, `module.exports`, class definitions, constants) exactly where they are — only reorder methods/functions.

4. **Add a single-line separator comment** between each group to mark the boundary. Format:
   - JavaScript/TypeScript: `// --- Group Name ---`
   - Python: `# --- Group Name ---`
   - Use a name that reflects what the group actually does (e.g. `// --- Job Queries ---`, `// --- Validation ---`).
   - Do NOT add any other comments — no function-level comments, no inline comments, nothing else.

## Strict rules

- **Never** change any line of actual code — no renames, no rewrites, no logic changes.
- **Never** add, remove, or modify function signatures, bodies, or expressions.
- **Never** add comments other than the single-line group separator comments described above.
- **Never** remove existing comments.
- **Only** allowed edits: reordering method blocks and inserting/removing the separator comment lines between groups.
- If a method does not clearly belong to any group, place it at the end in an `// --- Misc ---` section rather than forcing a grouping.
- If the file has only one logical group, add no separator comments at all.

After reorganizing, briefly tell the user: which groups you identified and how many methods are in each.
