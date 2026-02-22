# PDF Service — Claude Instructions

## Project Overview

Stateless REST microservice: `POST /api/v1/pdf` accepts an HTML template with `{{key}}` placeholders plus a JSON dictionary, substitutes all placeholders, renders to PDF via Puppeteer/headless Chromium, and returns the PDF binary. Delivered as a Docker image.

## Commands

```bash
npm test                 # run all tests once
npm run test:watch       # watch mode
npm run test:coverage    # coverage report (thresholds: 80% lines/functions, 75% branches)
npm run dev              # dev server with nodemon (port 3000)
npm start                # production server

docker compose up --build   # build and run in Docker
```

## Architecture

Pure ESM project (`"type": "module"`). All imports use `.js` extensions.

```
src/
  app.js              # Express app factory — export createApp(), no listen()
  server.js           # Entry point: listen + graceful shutdown (excluded from coverage)
  config/index.js     # All env-var reads in one place
  utils/logger.js     # Pino logger singleton
  schemas/
    pdfRequest.js     # Zod schema — source of truth for validation + API docs
  middleware/
    validate.js       # validate(schema) middleware factory — calls next(err) on failure
    errorHandler.js   # Central error handler — must be last middleware registered
  routes/
    pdf.js            # POST /api/v1/pdf
  services/
    templateEngine.js # Pure renderTemplate(template, data) — no side effects
    pdfGenerator.js   # Puppeteer browser singleton + generatePdf() + closeBrowser()
  docs/
    openapi.js        # OpenAPI 3.1 spec + Swagger UI (excluded from coverage)
tests/
  unit/               # templateEngine and pdfGenerator (puppeteer mocked)
  integration/        # pdf.route.test.js — uses supertest, mocks only pdfGenerator
```

## Key Conventions

**Error handling:** All errors use the JSON envelope `{ error: { code, message, details? } }`. Attach `.code` and optionally `.details` to http-errors objects before passing to `next(err)`. The `errorHandler` middleware formats them consistently.

**Error codes:**
- `VALIDATION_ERROR` — 400, Zod parse failure
- `PDF_GENERATION_FAILED` — 500, Puppeteer threw
- `PAYLOAD_TOO_LARGE` — 413, body > MAX_BODY_SIZE
- `NOT_FOUND` — 404, unknown route

**Template engine:** Unknown `{{placeholders}}` are left intact (not an error). Dotted keys like `{{user.name}}` are flat dictionary lookups, not nested traversal. Values are coerced with `String()`.

**Puppeteer singleton:** `pdfGenerator.js` holds one browser process reused across requests. It self-heals on `disconnected` by nulling the singleton. Each request opens a new page, closed in `finally`. `closeBrowser()` is called on graceful shutdown.

**Validation middleware:** `validate(schema)` replaces `req.body` with the Zod-parsed (and defaulted) value on success, so route handlers always receive fully-typed, defaulted input.

## Testing Patterns

**ESM mocking with vi.hoisted:** Because `vi.mock()` is hoisted above imports, use `vi.hoisted()` to share mock objects between the factory and test code:

```js
const { mockPage } = vi.hoisted(() => ({
  mockPage: { setContent: vi.fn(), pdf: vi.fn(), close: vi.fn() },
}));
vi.mock('puppeteer', () => ({ default: { launch: vi.fn().mockResolvedValue(...) } }));
```

**Integration tests:** Mock only `pdfGenerator` — let real middleware, validation, and routing run. Use `vi.mock('../../src/services/pdfGenerator.js', ...)` before importing `createApp()`.

**Coverage exclusions:** `src/server.js` and `src/docs/**` are excluded in `vitest.config.js`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `LOG_LEVEL` | `info` | Pino log level |
| `PDF_TIMEOUT_MS` | `30000` | Puppeteer timeout per request (ms) |
| `MAX_BODY_SIZE` | `5mb` | Express body size limit |
| `PUPPETEER_NO_SANDBOX` | `false` | Set `true` only when forced to run as root |
| `SWAGGER_UI_ENABLED` | `true` | Toggle Swagger UI at `/docs` |

## Docker Notes

- Multi-stage build: `deps` stage installs deps and downloads bundled Chromium; `runtime` stage copies only `node_modules` — no build tools in final image.
- Base image: `node:20-bookworm-slim` — matches the OS expected by Puppeteer's bundled Chrome.
- Runs as non-root user `pptruser`. `--no-sandbox` is NOT needed when running as non-root.
- `docker-compose.yml` sets `cap_add: SYS_ADMIN` and `shm_size: 256mb` (Docker's default `/dev/shm` of 64 MB causes Chrome crashes).
