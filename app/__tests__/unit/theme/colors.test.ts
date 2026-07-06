import { colors } from '@/src/theme/colors';
import { motion } from '@/src/theme/motion';
import { radius, space, layout } from '@/src/theme/spacing';
import { fonts, fontWeights, textSizes, tracking } from '@/src/theme/typography';

describe('theme tokens', () => {
  it('exposes the cream background and pink accent from design.md', () => {
    expect(colors.bg).toBe('#f7f4ed');
    expect(colors.surface).toBe('#f7f4ed');
    expect(colors.accent).toBe('#ff4d8d');
  });

  it('uses charcoal for foreground and dark CTAs', () => {
    expect(colors.fg).toBe('#1c1c1c');
    expect(colors.textOnDark).toBe('#fcfbf8');
  });

  it('never exceeds a 600 font weight ceiling', () => {
    expect(fontWeights.semibold).toBe('600');
    expect(fontWeights.regular).toBe('400');
  });

  it('mirrors the prototype spacing scale', () => {
    expect(space[4]).toBe(16);
    expect(radius.sm).toBe(6);
    expect(radius.pill).toBe(9999);
    expect(layout.thumb).toBe(44);
  });

  it('keeps motion durations in milliseconds', () => {
    expect(motion.base).toBe(200);
    expect(motion.snackbarDuration).toBe(2200);
  });

  it('exports a monospace font for captions', () => {
    expect(fonts.mono).toContain('ui-monospace');
    expect(tracking.caption).toBe(0.04);
    expect(textSizes.xs).toBe(12);
  });
});
