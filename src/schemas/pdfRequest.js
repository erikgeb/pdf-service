import { z } from 'zod';

const marginSchema = z.object({
  top: z.string().default('10mm'),
  right: z.string().default('10mm'),
  bottom: z.string().default('10mm'),
  left: z.string().default('10mm'),
});

const pdfOptionsSchema = z.object({
  format: z
    .enum(['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid', 'Ledger'])
    .default('A4'),
  landscape: z.boolean().default(false),
  printBackground: z.boolean().default(true),
  margin: marginSchema.default(marginSchema.parse({})),
});

export const pdfRequestSchema = z.object({
  template: z.string().min(1, 'template must be a non-empty string'),
  data: z.record(z.unknown()).default({}),
  options: pdfOptionsSchema.default(pdfOptionsSchema.parse({})),
});
