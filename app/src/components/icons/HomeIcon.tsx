import Svg, { Path, Polyline } from 'react-native-svg';

export interface HomeIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Home outline extracted from `prototipo/home.html` navigation bar.
 */
export function HomeIcon({ size = 24, color = 'currentColor', strokeWidth = 1.8 }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="9 22 9 12 15 12 15 22"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
