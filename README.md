# PDF Service

Stateless REST microservice: POST an HTML template + JSON data, get a PDF back.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

```bash
curl -X POST http://localhost:3000/api/v1/pdf \
  -H "Content-Type: application/json" \
  -d '{"template":"<h1>Hello, {{name}}!</h1>","data":{"name":"World"}}' \
  --output test.pdf
```

## API

### `POST /api/v1/pdf`

| Field | Type | Required | Description |
|---|---|---|---|
| `template` | string | yes | HTML with `{{key}}` placeholders |
| `data` | object | no | Placeholder values (default `{}`) |
| `options.format` | string | no | Page format (default `A4`) |
| `options.landscape` | boolean | no | Landscape orientation (default `false`) |
| `options.printBackground` | boolean | no | Print CSS backgrounds (default `true`) |
| `options.margin` | object | no | Page margins (default `10mm` each side) |

Returns `200 application/pdf` on success.

### `GET /health`

Returns `{ status, uptime, timestamp }`.

### `GET /docs`

Swagger UI (disable with `SWAGGER_UI_ENABLED=false`).

## Docker

```bash
docker compose up --build
```

## Tests

```bash
npm test                # run all tests
npm run test:coverage   # with coverage (80/80/75 thresholds)
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `LOG_LEVEL` | `info` | Pino log level |
| `PDF_TIMEOUT_MS` | `30000` | Puppeteer timeout per request |
| `MAX_BODY_SIZE` | `5mb` | Max request body size |
| `PUPPETEER_NO_SANDBOX` | `false` | Set `true` only if running as root |
| `SWAGGER_UI_ENABLED` | `true` | Toggle Swagger UI at `/docs` |
