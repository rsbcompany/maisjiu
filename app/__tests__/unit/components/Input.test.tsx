import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/src/components/Input';
import { colors } from '@/src/theme/colors';

describe('Input', () => {
  it('applies the danger border color when error is true', () => {
    const { getByTestId } = render(<Input testID="input" error />);
    const input = getByTestId('input');

    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: colors.danger }),
      ])
    );
  });

  it('uses the default border color when there is no error', () => {
    const { getByTestId } = render(<Input testID="input" />);
    const input = getByTestId('input');

    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: colors.border }),
      ])
    );
  });

  it('switches border to accent on focus', () => {
    const { getByTestId } = render(<Input testID="input" />);
    const input = getByTestId('input');

    fireEvent(input, 'focus');

    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: colors.accent }),
      ])
    );
  });

  it('returns to the default border after blur', () => {
    const { getByTestId } = render(<Input testID="input" />);
    const input = getByTestId('input');

    fireEvent(input, 'focus');
    fireEvent(input, 'blur');

    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: colors.border }),
      ])
    );
  });

  it('invokes external focus and blur handlers', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByTestId } = render(
      <Input testID="input" onFocus={onFocus} onBlur={onBlur} />
    );
    const input = getByTestId('input');

    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
