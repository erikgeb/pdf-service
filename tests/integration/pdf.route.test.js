import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

// Mock pdfGenerator before importing app
vi.mock('../../src/services/pdfGenerator.js', () => ({
  generatePdf: vi.fn(),
}));

import { generatePdf } from '../../src/services/pdfGenerator.js';
import { createApp } from '../../src/app.js';

let app;

beforeAll(() => {
  app = createApp();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('POST /api/v1/pdf', () => {
  it('returns 200 application/pdf for a valid request', async () => {
    const fakePdf = Buffer.from('%PDF-fake');
    generatePdf.mockResolvedValueOnce(fakePdf);

    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ template: '<h1>Hello, {{name}}!</h1>', data: { name: 'World' } });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.body).toBeInstanceOf(Buffer);
  });

  it('applies default options when options are omitted', async () => {
    const fakePdf = Buffer.from('%PDF-fake');
    generatePdf.mockResolvedValueOnce(fakePdf);

    await request(app)
      .post('/api/v1/pdf')
      .send({ template: '<p>Test</p>' });

    expect(generatePdf).toHaveBeenCalledWith(
      '<p>Test</p>',
      expect.objectContaining({ format: 'A4', landscape: false, printBackground: true })
    );
  });

  it('returns 400 VALIDATION_ERROR when template is missing', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ data: { name: 'World' } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeInstanceOf(Array);
  });

  it('returns 400 VALIDATION_ERROR when template is empty string', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ template: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR when format is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ template: '<p>hi</p>', options: { format: 'INVALID' } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 PDF_GENERATION_FAILED when generator throws', async () => {
    generatePdf.mockRejectedValueOnce(new Error('Chrome crashed'));

    const res = await request(app)
      .post('/api/v1/pdf')
      .send({ template: '<p>Fail</p>' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('PDF_GENERATION_FAILED');
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('Unknown routes', () => {
  it('returns 404 NOT_FOUND for unknown routes', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
