import { z } from 'zod';

const marginSchema = z.object({
  top: z.string().optional().default('10mm'),
  right: z.string().optional().default('10mm'),
  bottom: z.string().optional().default('10mm'),
  left: z.string().optional().default('10mm'),
});

const pdfOptionsSchema = z.object({
  format: z
    .enum(['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid', 'Ledger'])
    .optional()
    .default('A4'),
  landscape: z.boolean().optional().default(false),
  printBackground: z.boolean().optional().default(true),
  margin: marginSchema.optional().default({}),
});

export const pdfRequestSchema = z.object({
  template: z.string().min(1, 'template must be a non-empty string'),
  data: z.record(z.unknown()).optional().default({}),
  options: pdfOptionsSchema.optional().default({}),
});
