/**
 * Normalizes text to be case- and accent-insensitive, matching the search
 * normalization used by the content repository and `prototipo/search.html`.
 * Strips diacritics (NFD + combining marks) and lowercases.
 */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
