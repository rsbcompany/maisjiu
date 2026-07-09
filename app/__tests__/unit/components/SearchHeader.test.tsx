import { fireEvent, render } from '@testing-library/react-native';
import { SearchHeader } from '@/src/components/SearchHeader';

describe('SearchHeader', () => {
  it('renders the pill input with the search icon', () => {
    const { getByTestId } = render(<SearchHeader value="" onChangeText={jest.fn()} />);

    expect(getByTestId('search-header-input')).toBeTruthy();
  });

  it('displays the current value', () => {
    const { getByDisplayValue } = render(
      <SearchHeader value="Passagem" onChangeText={jest.fn()} />
    );

    expect(getByDisplayValue('Passagem')).toBeTruthy();
  });

  it('calls onChangeText when the user types', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(<SearchHeader value="" onChangeText={onChangeText} />);

    fireEvent.changeText(getByTestId('search-header-input'), 'Meia');

    expect(onChangeText).toHaveBeenCalledWith('Meia');
  });
});
