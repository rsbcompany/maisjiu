import { fireEvent, render } from '@testing-library/react-native';
import { VideoCard } from '@/src/components/VideoCard';

const baseProps = {
  id: 'v1',
  title: 'Passagem básica da meia',
  tags: ['Passagem', 'Meia-guarda'],
  hue: 10,
  onPress: jest.fn(),
};

describe('VideoCard', () => {
  it('calls onPress with the video id when pressed', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByTestId } = render(
      <VideoCard {...baseProps} onPress={onPress} testID="video-card-v1" />
    );

    // Act
    fireEvent.press(getByTestId('video-card-v1'));

    // Assert
    expect(onPress).toHaveBeenCalledWith('v1');
  });

  it('renders the title and tag chips', () => {
    // Arrange / Act
    const { getByText } = render(<VideoCard {...baseProps} />);

    // Assert
    expect(getByText('Passagem básica da meia')).toBeTruthy();
    expect(getByText('Passagem')).toBeTruthy();
    expect(getByText('Meia-guarda')).toBeTruthy();
  });

  it('shows the duration badge only when a duration is provided', () => {
    // Arrange / Act
    const { queryByText, rerender } = render(<VideoCard {...baseProps} />);
    expect(queryByText('0:42')).toBeNull();

    rerender(<VideoCard {...baseProps} duration="0:42" />);

    // Assert
    expect(queryByText('0:42')).toBeTruthy();
  });
});
