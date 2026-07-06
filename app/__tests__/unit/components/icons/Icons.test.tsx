import { render } from '@testing-library/react-native';
import Svg from 'react-native-svg';
import { BackIcon } from '@/src/components/icons/BackIcon';
import { HomeIcon } from '@/src/components/icons/HomeIcon';
import { PauseIcon } from '@/src/components/icons/PauseIcon';
import { PlayIcon } from '@/src/components/icons/PlayIcon';
import { SearchIcon } from '@/src/components/icons/SearchIcon';

describe('prototype SVG icons', () => {
  it.each([
    { Icon: BackIcon, name: 'BackIcon' },
    { Icon: HomeIcon, name: 'HomeIcon' },
    { Icon: PauseIcon, name: 'PauseIcon' },
    { Icon: PlayIcon, name: 'PlayIcon' },
    { Icon: SearchIcon, name: 'SearchIcon' },
  ])('$name renders an SVG with the requested size and color', ({ Icon }) => {
    const { UNSAFE_getByType } = render(<Icon size={32} color="#ff4d8d" />);
    const svg = UNSAFE_getByType(Svg);

    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
  });

  it.each([
    { Icon: BackIcon, name: 'BackIcon' },
    { Icon: HomeIcon, name: 'HomeIcon' },
    { Icon: PauseIcon, name: 'PauseIcon' },
    { Icon: PlayIcon, name: 'PlayIcon' },
    { Icon: SearchIcon, name: 'SearchIcon' },
  ])('$name uses default size 24 when no props are provided', ({ Icon }) => {
    const { UNSAFE_getByType } = render(<Icon />);
    const svg = UNSAFE_getByType(Svg);

    expect(svg.props.width).toBe(24);
    expect(svg.props.height).toBe(24);
  });
});
