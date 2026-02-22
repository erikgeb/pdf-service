import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../../src/services/templateEngine.js';

describe('renderTemplate', () => {
  it('replaces a single placeholder', () => {
    expect(renderTemplate('<h1>{{name}}</h1>', { name: 'World' })).toBe('<h1>World</h1>');
  });

  it('replaces multiple distinct placeholders', () => {
    const result = renderTemplate('{{a}} + {{b}}', { a: 'foo', b: 'bar' });
    expect(result).toBe('foo + bar');
  });

  it('replaces duplicate placeholders', () => {
    expect(renderTemplate('{{x}} and {{x}}', { x: 'hello' })).toBe('hello and hello');
  });

  it('leaves unknown placeholders intact', () => {
    expect(renderTemplate('Hello {{unknown}}', {})).toBe('Hello {{unknown}}');
  });

  it('coerces number values to strings', () => {
    expect(renderTemplate('{{count}}', { count: 42 })).toBe('42');
  });

  it('coerces boolean values to strings', () => {
    expect(renderTemplate('{{flag}}', { flag: false })).toBe('false');
  });

  it('handles empty template', () => {
    expect(renderTemplate('', { name: 'x' })).toBe('');
  });

  it('handles empty data with no placeholders', () => {
    expect(renderTemplate('<p>Hello</p>', {})).toBe('<p>Hello</p>');
  });

  it('handles template with no placeholders', () => {
    expect(renderTemplate('<p>Static</p>', { name: 'ignored' })).toBe('<p>Static</p>');
  });

  it('treats dotted keys as flat dictionary keys', () => {
    expect(renderTemplate('{{user.name}}', { 'user.name': 'Alice' })).toBe('Alice');
  });

  it('leaves dotted key intact when not in data', () => {
    expect(renderTemplate('{{user.name}}', {})).toBe('{{user.name}}');
  });

  it('handles multiple replacements in a complex template', () => {
    const template = '<html><body><h1>{{title}}</h1><p>Dear {{name}}, you have {{count}} messages.</p></body></html>';
    const data = { title: 'Inbox', name: 'Bob', count: 3 };
    const result = renderTemplate(template, data);
    expect(result).toBe('<html><body><h1>Inbox</h1><p>Dear Bob, you have 3 messages.</p></body></html>');
  });
});
