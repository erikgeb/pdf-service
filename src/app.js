import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import createError from 'http-errors';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { pdfRouter } from './routes/pdf.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // Request logging
  app.use(pinoHttp({ logger }));

  // Body parsing with size limit
  app.use(express.json({ limit: config.maxBodySize }));

  // Handle body-too-large errors from express json parser
  app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
      const e = createError(413, 'Request body too large');
      e.code = 'PAYLOAD_TOO_LARGE';
      return next(e);
    }
    next(err);
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Swagger UI (optional)
  if (config.swaggerUiEnabled) {
    // Loaded dynamically to keep import chain clean; docs are optional
    import('./docs/openapi.js').then(({ setupDocs }) => setupDocs(app)).catch(() => {
      logger.warn('Failed to load Swagger UI — continuing without docs');
    });
  }

  // PDF route
  app.use('/api/v1/pdf', pdfRouter);

  // 404 handler
  app.use((req, res, next) => {
    const err = createError(404, `Route ${req.method} ${req.url} not found`);
    err.code = 'NOT_FOUND';
    next(err);
  });

  // Central error handler (must be last)
  app.use(errorHandler);

  return app;
}
