import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import type { VideoPlayer } from 'expo-video';
import { ReelsStage } from '@/src/components/reels/ReelsStage';

const player = {} as unknown as VideoPlayer;

describe('ReelsStage', () => {
  it('fires onBack when the back control is pressed', () => {
    // Arrange
    const onBack = jest.fn();
    const { getByTestId } = render(
      <ReelsStage player={player} onBack={onBack} onTogglePlay={jest.fn()} isPlaying={false} playButtonVisible>
        <Text>overlay</Text>
      </ReelsStage>
    );

    // Act
    fireEvent.press(getByTestId('reels-back'));

    // Assert
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('fires onTogglePlay from the play button and the video area', () => {
    // Arrange
    const onTogglePlay = jest.fn();
    const { getByTestId } = render(
      <ReelsStage player={player} onBack={jest.fn()} onTogglePlay={onTogglePlay} isPlaying={false} playButtonVisible>
        <Text>overlay</Text>
      </ReelsStage>
    );

    // Act
    fireEvent.press(getByTestId('reels-play'));
    fireEvent.press(getByTestId('reels-video-area'));

    // Assert
    expect(onTogglePlay).toHaveBeenCalledTimes(2);
  });

  it('labels the play control as "Pausar" while playing', () => {
    // Arrange & Act
    const { getByLabelText } = render(
      <ReelsStage player={player} onBack={jest.fn()} onTogglePlay={jest.fn()} isPlaying playButtonVisible>
        <Text>overlay</Text>
      </ReelsStage>
    );

    // Assert
    expect(getByLabelText('Pausar')).toBeTruthy();
  });

  it('renders the overlay children', () => {
    // Arrange & Act
    const { getByText } = render(
      <ReelsStage player={player} onBack={jest.fn()} onTogglePlay={jest.fn()} isPlaying={false} playButtonVisible>
        <Text>overlay</Text>
      </ReelsStage>
    );

    // Assert
    expect(getByText('overlay')).toBeTruthy();
  });
});
