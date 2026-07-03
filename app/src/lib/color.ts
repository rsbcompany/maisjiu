const HUE_WHEEL = 360;
const THUMB_TOP = { saturation: 70, lightness: 28 } as const;
const THUMB_BOTTOM = { saturation: 60, lightness: 14 } as const;

/**
 * Derives a stable hue (0–359) from an arbitrary id so each video gets a
 * consistent placeholder color until real CDN thumbnails exist (task_08+).
 */
export function deriveHue(id: string): number {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum % HUE_WHEEL;
}

/**
 * Returns the two hex stops for the diagonal thumb gradient described in
 * `prototipo/design.md` §3 (135deg, hsl(hue 70% 28%) → hsl(hue 60% 14%)).
 */
export function getThumbGradientColors(hue: number): readonly [string, string] {
  const top = hslToHex(hue, THUMB_TOP.saturation, THUMB_TOP.lightness);
  const bottom = hslToHex(hue, THUMB_BOTTOM.saturation, THUMB_BOTTOM.lightness);
  return [top, bottom] as const;
}

/** Converts an HSL color (h in degrees, s/l in percent) to a `#rrggbb` string. */
export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const { red, green, blue } = hslToRgb(hue, saturation / 100, lightness / 100);
  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

function hslToRgb(hue: number, saturation: number, lightness: number) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;
  return applyChannelBase(pickChannels(hue, chroma, secondary), match);
}

function pickChannels(hue: number, chroma: number, secondary: number) {
  const sector = Math.floor(hue / 60) % 6;
  const table = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ];
  return table[sector];
}

function applyChannelBase(channels: number[], match: number) {
  return {
    red: Math.round((channels[0] + match) * 255),
    green: Math.round((channels[1] + match) * 255),
    blue: Math.round((channels[2] + match) * 255),
  };
}

function toHexByte(value: number): string {
  return value.toString(16).padStart(2, '0');
}
