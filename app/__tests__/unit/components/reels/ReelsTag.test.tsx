import { fireEvent, render } from '@testing-library/react-native';
import { ReelsTag } from '@/src/components/reels/ReelsTag';

describe('ReelsTag', () => {
  it('renders its label', () => {
    // Arrange & Act
    const { getByText } = render(<ReelsTag label="Passagem" onPress={jest.fn()} />);

    // Assert
    expect(getByText('Passagem')).toBeTruthy();
  });

  it('calls onPress with the label when tapped', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByText } = render(<ReelsTag label="Meia-guarda" onPress={onPress} />);

    // Act
    fireEvent.press(getByText('Meia-guarda'));

    // Assert
    expect(onPress).toHaveBeenCalledWith('Meia-guarda');
  });
});
