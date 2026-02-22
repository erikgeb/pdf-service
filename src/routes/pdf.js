import { Router } from 'express';
import createError from 'http-errors';
import { validate } from '../middleware/validate.js';
import { pdfRequestSchema } from '../schemas/pdfRequest.js';
import { renderTemplate } from '../services/templateEngine.js';
import { generatePdf } from '../services/pdfGenerator.js';

const router = Router();

router.post('/', validate(pdfRequestSchema), async (req, res, next) => {
  try {
    const { template, data, options } = req.body;
    const html = renderTemplate(template, data);
    const pdfBuffer = await generatePdf(html, options);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'inline; filename="document.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    const error = createError(500, 'PDF generation failed');
    error.code = 'PDF_GENERATION_FAILED';
    next(error);
  }
});

export { router as pdfRouter };
