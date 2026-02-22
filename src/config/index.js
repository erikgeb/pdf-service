export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  pdfTimeoutMs: parseInt(process.env.PDF_TIMEOUT_MS ?? '30000', 10),
  maxBodySize: process.env.MAX_BODY_SIZE ?? '5mb',
  noSandbox: process.env.PUPPETEER_NO_SANDBOX === 'true',
  swaggerUiEnabled: process.env.SWAGGER_UI_ENABLED !== 'false',
};
