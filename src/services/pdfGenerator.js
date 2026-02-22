import puppeteer from 'puppeteer';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/** @type {import('puppeteer').Browser | null} */
let browser = null;

async function getBrowser() {
  if (browser) return browser;

  const args = ['--disable-dev-shm-usage'];
  if (config.noSandbox) {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  browser = await puppeteer.launch({
    headless: true,
    args,
  });

  browser.on('disconnected', () => {
    logger.warn('Puppeteer browser disconnected — will relaunch on next request');
    browser = null;
  });

  logger.info('Puppeteer browser launched');
  return browser;
}

/**
 * Render HTML to PDF and return the buffer.
 *
 * @param {string} html
 * @param {object} options  Puppeteer PDF options subset
 * @returns {Promise<Buffer>}
 */
export async function generatePdf(html, options = {}) {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: config.pdfTimeoutMs });
    const buffer = await page.pdf(options);
    return Buffer.from(buffer);
  } finally {
    await page.close();
  }
}

/**
 * Gracefully close the browser (called on process shutdown).
 */
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    logger.info('Puppeteer browser closed');
  }
}
