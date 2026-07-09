/**
 * Normalizes a tag string for case- and accent-insensitive comparison.
 *
 * Matches the server-side normalization used by the Postgres `f_unaccent`
 * function and the behavior in `prototipo/search.html`.
 */
export function normalizeTag(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
