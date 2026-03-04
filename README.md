# Budget Tracker Backend

Simple REST API for managing budgets, categories and transactions.

## Debugging 🐞

This project uses the [`debug`](https://www.npmjs.com/package/debug) package
with a set of namespaces defined in `src/utils/debug.ts`. In development the
library is enabled by default (`app*`), but you can control it with the
`DEBUG` environment variable.

### Useful commands

```bash
# start server with automatic reload
npm run dev

# enable verbose output from express/mongoose/jwt
npm run dev:verbose

# start built code and break into debugger
npm run debug
```

### Middleware & helpers

- `logRequest` / `logResponse` – attach to Express to dump headers, body,
  query parameters, etc. These are automatically registered in
  `src/app.ts` when running in development or when `DEBUG` is defined.
- `logPerformance(label)` – measure and warn on slow operations.
- `logMemory()` – print current memory usage to the debug logger.

Set `DEBUG=app*` (or a narrower namespace such as `app:db`) to see output:

```bash
DEBUG=app* npm run dev
```

### Testing notes

The Jest configuration uses a setup file (`src/tests/setup.ts`) which
automatically connects to the in‑memory/test database and disables both
Winston and `debug` output so test logs remain clean. You generally don't need
to manage connections within individual spec files.

```bash
npm test          # runs the suite with debugging turned off
npm run test:watch
```

More information about the `debug` package can be found on its npm page.
