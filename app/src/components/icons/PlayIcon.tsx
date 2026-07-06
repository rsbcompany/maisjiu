import Svg, { Path } from 'react-native-svg';

export interface PlayIconProps {
  size?: number;
  color?: string;
}

/**
 * Play triangle extracted from `prototipo/home.html` and `prototipo/player.html`.
 */
export function PlayIcon({ size = 24, color = 'currentColor' }: PlayIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M8 5v14l11-7z" />
    </Svg>
  );
}
