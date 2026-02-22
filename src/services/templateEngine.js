/**
 * Replace {{key}} placeholders in a template string with values from data.
 * - Unknown placeholders are left intact.
 * - Dotted keys like {{user.name}} are treated as flat dictionary keys.
 * - All values are coerced to strings via String().
 *
 * @param {string} template
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export function renderTemplate(template, data) {
  return template.replace(/\{\{([\w.]+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : match
  );
}
