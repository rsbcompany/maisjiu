/**
 * Typography tokens from `prototipo/design.md` §2.
 *
 * The prototype uses Camera Plain Variable; on React Native we fall back to
 * the system font stack while preserving the 400/600 weight ceiling. The
 * prototype's `display: 480` weight is specific to the variable font and is
 * omitted from RN-ready helpers because React Native only supports standard
 * 100–900 font weights.
 */
export const fonts = {
  display:
    'CameraPlain, "Camera Plain Variable", ui-sans-serif, system-ui, sans-serif',
  body: 'CameraPlain, "Camera Plain Variable", ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
} as const;

/** Font weights. 700/bold does not exist in this system — 600 is the max. */
export const fontWeights = {
  regular: '400' as const,
  semibold: '600' as const,
} as const;

/** Text size scale (px). */
export const textSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 36,
  '3xl': 48,
  '4xl': 60,
} as const;

/** Line-height scale. */
export const lineHeights = {
  /** Body copy. */
  body: 1.5,
  /** Headings. */
  tight: 1.1,
} as const;

/** Letter-spacing scale (em). */
export const tracking = {
  /** Display headings — scales with font size. */
  display: -0.025,
  /** Section/card headings. */
  heading: -0.01,
  /** Captions / uppercase labels. */
  caption: 0.04,
} as const;
