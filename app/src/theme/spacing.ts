/**
 * Spacing, radius and layout tokens from `prototipo/design.md` §2.
 * Based on an 8px grid with 4px half-steps.
 */

/** Space scale (px). */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
} as const;

/** Border radius scale (px). */
export const radius = {
  /** Buttons, inputs (functional). */
  sm: 6,
  /** Cards, video thumbs, feed items. */
  md: 12,
  /** Week card, brand mark, large containers. */
  lg: 16,
  /** Pills, icon toggles, tag chips, search input. */
  pill: 9999,
} as const;

/** Fixed layout constants from the prototype frame. */
export const layout = {
  appWidth: 412,
  appHeight: 915,
  statusBarHeight: 28,
  navBarHeight: 56,
  headerHeight: 56,
  /** Minimum touch target size (px). */
  thumb: 44,
} as const;

/** Horizontal page gutter (px). */
export const gutter = 16;
