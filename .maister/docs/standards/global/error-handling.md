## Error Handling

### Domain Throws Typed Errors, the Edge Maps Them

Domain code signals a business failure by throwing `MissingComponentError` carrying a structured
`query` describing what was missing. There is no `try`/`catch` anywhere inside the domain package.
The API maps the error at its edge, through the exported `isMissingComponentError` guard rather than
an `instanceof` check, to a 422 response or to a nullable result.

```ts
throw new MissingComponentError(`No foot found for depth ${depth}cm`, {
  category: "foot",
  depth,
})
```

### Unexpected Errors: Log With a Prefix, Answer Generically

A catch block around infrastructure work logs the real error as
`console.error("<What> failed:", error)` and replies `{ error: "<What> failed" }` with status 500.
Internal details, stack traces and database messages never reach the client.

### Every Response Names Its Status

`res.status(n).json(...)` for a body, `res.sendStatus(n)` for an empty one. A delete answers 204. A
bare `res.json(...)` is not used for an endpoint result.

### Handle at the Boundary

Errors are caught in the controller, not scattered through the layers below it. There is no Express
error middleware: each controller owns its own handling.

### Fail Fast

Inputs are validated and preconditions checked before any work happens. See `validation.md`.
