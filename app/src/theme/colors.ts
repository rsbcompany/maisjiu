/**
 * Color tokens extracted from `prototipo/css/app.css` `:root` and
 * `prototipo/design.md` §2. These are the canonical colors for the Mais Jiu
 * app; screens should import from `@/theme` instead of hard-coding values.
 */
export const colors = {
  /** Cream parchment — page + card surface. Never use pure white (#fff). */
  bg: '#f7f4ed',
  /** Cards reuse the canvas; border is the separator. */
  surface: '#f7f4ed',
  /** Charcoal — primary text and dark CTA background. */
  fg: '#1c1c1c',
  /** Strong secondary text (fg at 83% opacity). */
  fg2: 'rgba(28,28,28,0.83)',
  /** Descriptions, captions. */
  muted: '#5f5f5d',
  /** Placeholders, interactive borders. */
  meta: 'rgba(28,28,28,0.4)',
  /** Light cream — passive divider (cards, inputs). */
  border: '#eceae4',
  /** Lovable Pink — the only chromatic accent. Use sparingly (≤2 spots/screen). */
  accent: '#ff4d8d',
  /** Text over accent surfaces. */
  accentOn: '#ffffff',
  /** Accent + black 8% — hover state. */
  accentHover: '#e8457f',
  /** Accent + black 14% — active state. */
  accentActive: '#d93d7e',
  /** Text over charcoal/pink surfaces. */
  textOnDark: '#fcfbf8',
  /** Pure white reserved for overlays on video/dark surfaces. */
  white: '#ffffff',
  /** Success state. */
  success: '#16a34a',
  /** Warning state. */
  warn: '#eab308',
  /** Danger/error state and invalid input borders. */
  danger: '#dc2626',
} as const;

export type ColorKey = keyof typeof colors;
