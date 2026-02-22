import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted runs before vi.mock — variables are accessible in the factory
const { mockPage, mockBrowser } = vi.hoisted(() => {
  const mockPage = {
    setContent: vi.fn().mockResolvedValue(undefined),
    pdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 test')),
    close: vi.fn().mockResolvedValue(undefined),
  };
  const mockBrowser = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    on: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return { mockPage, mockBrowser };
});

vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue(mockBrowser),
  },
}));

import puppeteer from 'puppeteer';
import { generatePdf, closeBrowser } from '../../src/services/pdfGenerator.js';

beforeEach(async () => {
  vi.clearAllMocks();
  // Re-apply implementations after clearAllMocks clears call history
  mockPage.setContent.mockResolvedValue(undefined);
  mockPage.pdf.mockResolvedValue(Buffer.from('%PDF-1.4 test'));
  mockPage.close.mockResolvedValue(undefined);
  mockBrowser.newPage.mockResolvedValue(mockPage);
  mockBrowser.close.mockResolvedValue(undefined);
  puppeteer.launch.mockResolvedValue(mockBrowser);
  // Reset the module-level browser singleton so each test gets a fresh launch
  await closeBrowser();
});

describe('generatePdf', () => {
  it('returns a Buffer', async () => {
    const result = await generatePdf('<h1>Test</h1>', { format: 'A4' });
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('calls setContent with the provided HTML', async () => {
    await generatePdf('<p>Hello</p>', {});
    expect(mockPage.setContent).toHaveBeenCalledWith(
      '<p>Hello</p>',
      expect.objectContaining({ waitUntil: 'networkidle0' })
    );
  });

  it('calls page.pdf with the provided options', async () => {
    const options = { format: 'Letter', landscape: true };
    await generatePdf('<p>Test</p>', options);
    expect(mockPage.pdf).toHaveBeenCalledWith(options);
  });

  it('closes the page in finally even when pdf() throws', async () => {
    mockPage.pdf.mockRejectedValueOnce(new Error('PDF failed'));
    await expect(generatePdf('<p>Fail</p>', {})).rejects.toThrow('PDF failed');
    expect(mockPage.close).toHaveBeenCalled();
  });

  it('closes the page in finally even when setContent() throws', async () => {
    mockPage.setContent.mockRejectedValueOnce(new Error('Timeout'));
    await expect(generatePdf('<p>Timeout</p>', {})).rejects.toThrow('Timeout');
    expect(mockPage.close).toHaveBeenCalled();
  });
});

describe('closeBrowser', () => {
  it('can be called without error when no browser is open', async () => {
    // Singleton was already closed in beforeEach
    await expect(closeBrowser()).resolves.toBeUndefined();
  });

  it('closes the browser and nulls the singleton', async () => {
    // Open a browser first
    await generatePdf('<p>x</p>', {});
    // Now close it
    await closeBrowser();
    expect(mockBrowser.close).toHaveBeenCalled();
  });
});
