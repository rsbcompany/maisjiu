import { deriveHue, getThumbGradientColors, hslToHex } from '@/src/lib/color';

describe('hslToHex', () => {
  it('converts primary red', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });

  it('converts primary green', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00ff00');
  });

  it('converts pure black and white', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
    expect(hslToHex(0, 0, 100)).toBe('#ffffff');
  });
});

describe('deriveHue', () => {
  it('is deterministic for the same id', () => {
    expect(deriveHue('v1')).toBe(deriveHue('v1'));
  });

  it('stays within the hue wheel range', () => {
    const hue = deriveHue('some-video-uuid');
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });
});

describe('getThumbGradientColors', () => {
  it('returns two distinct hex stops', () => {
    const [top, bottom] = getThumbGradientColors(200);
    expect(top).toMatch(/^#[0-9a-f]{6}$/);
    expect(bottom).toMatch(/^#[0-9a-f]{6}$/);
    expect(top).not.toBe(bottom);
  });
});
