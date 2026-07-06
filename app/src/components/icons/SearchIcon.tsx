import Svg, { Circle, Path } from 'react-native-svg';

export interface SearchIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Magnifying glass extracted from `prototipo/home.html` and
 * `prototipo/search.html`.
 */
export function SearchIcon({ size = 24, color = 'currentColor', strokeWidth = 1.8 }: SearchIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={strokeWidth} />
      <Path d="M20 20l-3.5-3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
