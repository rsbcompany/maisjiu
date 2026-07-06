/**
 * Motion tokens from `prototipo/design.md` §2.
 *
 * Durations are in milliseconds. The standard easing maps to
 * `Easing.bezier(0.2, 0, 0, 1)` in React Native's Animated API.
 */
export const motion = {
  /** Hover, active feedback. */
  fast: 150,
  /** Sheet expand, fade, snackbar entrance. */
  base: 200,
  /** Snackbar auto-hide default (ms). */
  snackbarDuration: 2200,
  /** Player snackbar auto-hide (ms). */
  playerSnackbarDuration: 2400,
  /** Standard easing curve as React Native bezier control points. */
  easeStandard: [0.2, 0, 0, 1] as const,
} as const;
