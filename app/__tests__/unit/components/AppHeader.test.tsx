import { fireEvent, render } from '@testing-library/react-native';
import { AppHeader } from '@/src/components/AppHeader';

describe('AppHeader', () => {
  it('renders the greeting caption and the student name', () => {
    // Arrange / Act
    const { getByText } = render(
      <AppHeader greeting="Bom dia" name="Rafael" onSearchPress={jest.fn()} />
    );

    // Assert
    expect(getByText('Bom dia,')).toBeTruthy();
    expect(getByText('Rafael')).toBeTruthy();
  });

  it('calls onSearchPress when the search button is pressed', () => {
    // Arrange
    const onSearchPress = jest.fn();
    const { getByTestId } = render(
      <AppHeader greeting="Bom dia" name="Rafael" onSearchPress={onSearchPress} />
    );

    // Act
    fireEvent.press(getByTestId('app-header-search'));

    // Assert
    expect(onSearchPress).toHaveBeenCalledTimes(1);
  });
});
