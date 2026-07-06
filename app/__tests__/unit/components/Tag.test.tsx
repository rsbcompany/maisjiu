import { render, fireEvent } from '@testing-library/react-native';
import { Tag } from '@/src/components/Tag';
import { colors } from '@/src/theme/colors';

describe('Tag', () => {
  it('renders the label text', () => {
    const { getByText } = render(<Tag label="Passagem" />);
    expect(getByText('Passagem')).toBeTruthy();
  });

  it('renders active state with filled charcoal background', () => {
    const { getByRole } = render(<Tag label="Passagem" active onPress={() => {}} />);
    const chip = getByRole('button');

    expect(chip.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.fg }),
      ])
    );
  });

  it('renders default state with transparent background', () => {
    const { getByTestId } = render(<Tag label="Passagem" testID="tag" />);
    const chip = getByTestId('tag');

    expect(chip.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'transparent' }),
      ])
    );
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Tag label="Passagem" onPress={onPress} />);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders accent variant with pink tint', () => {
    const { getByTestId } = render(<Tag label="Passagem" variant="accent" testID="tag" />);
    const chip = getByTestId('tag');

    expect(chip.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'rgba(255,77,141,0.10)' }),
      ])
    );
  });

  it('does not render as a button when onPress is omitted', () => {
    const { queryByRole } = render(<Tag label="Passagem" />);
    expect(queryByRole('button')).toBeNull();
  });
});
