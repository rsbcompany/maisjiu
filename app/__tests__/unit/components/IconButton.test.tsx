import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '@/src/components/IconButton';
import { SearchIcon } from '@/src/components/icons/SearchIcon';
import { layout } from '@/src/theme/spacing';

describe('IconButton', () => {
  it('enforces a minimum 44×44 touch target', () => {
    const { getByRole } = render(
      <IconButton icon={<SearchIcon size={22} />} ariaLabel="Buscar" />
    );
    const button = getByRole('button');

    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: layout.thumb,
          height: layout.thumb,
          minWidth: layout.thumb,
          minHeight: layout.thumb,
        }),
      ])
    );
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <IconButton icon={<SearchIcon size={22} />} ariaLabel="Buscar" onPress={onPress} />
    );

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes the accessible label', () => {
    const { getByLabelText } = render(
      <IconButton icon={<SearchIcon size={22} />} ariaLabel="Buscar" />
    );
    expect(getByLabelText('Buscar')).toBeTruthy();
  });
});
