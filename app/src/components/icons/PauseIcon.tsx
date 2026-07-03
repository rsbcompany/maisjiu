import Svg, { Path } from 'react-native-svg';

export interface PauseIconProps {
  size?: number;
  color?: string;
}

/**
 * Pause bars extracted from `prototipo/player.html`.
 */
export function PauseIcon({ size = 24, color = 'currentColor' }: PauseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </Svg>
  );
}
