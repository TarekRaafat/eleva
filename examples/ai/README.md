# Golden AI Examples

Minimal, self-contained examples designed for AI codegen validation. Each example demonstrates a single Eleva.js pattern in the fewest lines possible.

## Examples

| Example | Pattern | Key Concepts |
|---------|---------|-------------|
| [counter/](counter/) | Reactive counter | `signal()`, `@click`, template interpolation |
| [todo-app/](todo-app/) | Todo list | Signal arrays, list rendering with `key`, `onUnmount` cleanup |
| [agent-actions/](agent-actions/) | Agent plugin | Action registry, schema validation, audit log, error handling |

## Running

From the repository root:

```sh
bun run serve
```

Then open:
- http://localhost:3000/examples/ai/counter/
- http://localhost:3000/examples/ai/todo-app/
- http://localhost:3000/examples/ai/agent-actions/

## Purpose

These examples serve as ground-truth references for AI/LLM code generation. They are intentionally minimal — no external dependencies, no CSS frameworks, no build step. If an LLM-generated component follows these patterns, it is correct.
