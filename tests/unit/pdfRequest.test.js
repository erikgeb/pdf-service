import { describe, it, expect } from 'vitest';
import { pdfRequestSchema } from '../../src/schemas/pdfRequest.js';

describe('pdfRequestSchema', () => {
  it('parses valid payload with default options and data', () => {
    const result = pdfRequestSchema.safeParse({ template: '<h1>Hello</h1>' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      template: '<h1>Hello</h1>',
      data: {},
      options: {
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      },
    });
  });

  it('preserves explicit options and data', () => {
    const payload = {
      template: '<p>Test</p>',
      data: { key: 'value' },
      options: {
        format: 'A3',
        landscape: true,
        printBackground: false,
        margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
      },
    };
    const result = pdfRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(payload);
  });

  it('rejects missing or non-string template', () => {
    expect(pdfRequestSchema.safeParse({}).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ template: '' }).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ template: 123 }).success).toBe(false);
  });

  it('rejects invalid page format option', () => {
    const result = pdfRequestSchema.safeParse({
      template: '<p>Hi</p>',
      options: { format: 'INVALID_FORMAT' },
    });
    expect(result.success).toBe(false);
  });
});
