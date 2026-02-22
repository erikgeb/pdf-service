import swaggerUi from 'swagger-ui-express';

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'PDF Service',
    version: '1.0.0',
    description: 'Render HTML templates to PDF via Puppeteer/headless Chromium.',
  },
  paths: {
    '/api/v1/pdf': {
      post: {
        summary: 'Render HTML template to PDF',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['template'],
                properties: {
                  template: {
                    type: 'string',
                    minLength: 1,
                    description: 'HTML template with {{key}} placeholders',
                    example: '<h1>Hello, {{name}}!</h1>',
                  },
                  data: {
                    type: 'object',
                    additionalProperties: true,
                    description: 'Key-value pairs for placeholder substitution',
                    example: { name: 'Acme Corp' },
                  },
                  options: {
                    type: 'object',
                    properties: {
                      format: {
                        type: 'string',
                        enum: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid', 'Ledger'],
                        default: 'A4',
                      },
                      landscape: { type: 'boolean', default: false },
                      printBackground: { type: 'boolean', default: true },
                      margin: {
                        type: 'object',
                        properties: {
                          top: { type: 'string', default: '10mm' },
                          right: { type: 'string', default: '10mm' },
                          bottom: { type: 'string', default: '10mm' },
                          left: { type: 'string', default: '10mm' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'PDF binary',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
          400: { description: 'Validation error' },
          413: { description: 'Payload too large' },
          500: { description: 'PDF generation failed' },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    uptime: { type: 'number' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function setupDocs(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/docs.json', (req, res) => res.json(spec));
}
