import Svg, { Path } from 'react-native-svg';

export interface BackIconProps {
  size?: number;
  color?: string;
}

/**
 * Back arrow extracted from `prototipo/player.html` and `prototipo/search.html`.
 * Stroke-based chevron pointing left.
 */
export function BackIcon({ size = 24, color = 'currentColor' }: BackIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
