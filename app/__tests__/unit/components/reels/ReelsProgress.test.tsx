import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { colors } from '@/src/theme/colors';
import { ReelsProgress, clampRatio } from '@/src/components/reels/ReelsProgress';

function layout(width: number) {
  return { nativeEvent: { layout: { width, height: 18, x: 0, y: 0 } } };
}

describe('ReelsProgress', () => {
  it('renders a white fill, not the pink accent', () => {
    // Arrange & Act
    const { getByTestId } = render(<ReelsProgress progress={0.5} onScrub={jest.fn()} testID="reels-progress" />);

    // Assert
    const fill = StyleSheet.flatten(getByTestId('reels-progress-fill').props.style);
    expect(fill.backgroundColor).toBe(colors.white);
    expect(fill.backgroundColor).not.toBe(colors.accent);
  });

  it('sets the fill width from the progress fraction', () => {
    // Arrange & Act
    const { getByTestId } = render(<ReelsProgress progress={0.25} onScrub={jest.fn()} testID="reels-progress" />);

    // Assert
    const fill = StyleSheet.flatten(getByTestId('reels-progress-fill').props.style);
    expect(fill.width).toBe('25%');
  });

  it('clamps out-of-range progress into [0, 1]', () => {
    // Assert
    expect(clampRatio(-0.5)).toBe(0);
    expect(clampRatio(1.4)).toBe(1);
    expect(clampRatio(0.4)).toBe(0.4);
  });

  it('scrubs to the tapped ratio using the measured track width', () => {
    // Arrange
    const onScrub = jest.fn();
    const { getByTestId } = render(<ReelsProgress progress={0} onScrub={onScrub} testID="reels-progress" />);
    const track = getByTestId('reels-progress');

    // Act
    fireEvent(track, 'layout', layout(200));
    fireEvent.press(track, { nativeEvent: { locationX: 100 } });

    // Assert
    expect(onScrub).toHaveBeenCalledWith(0.5);
  });

  it('ignores scrubs before the track has been measured', () => {
    // Arrange
    const onScrub = jest.fn();
    const { getByTestId } = render(<ReelsProgress progress={0} onScrub={onScrub} testID="reels-progress" />);

    // Act
    fireEvent.press(getByTestId('reels-progress'), { nativeEvent: { locationX: 100 } });

    // Assert
    expect(onScrub).not.toHaveBeenCalled();
  });
});
