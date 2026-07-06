import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/src/components/Button';
import { colors } from '@/src/theme/colors';

describe('Button', () => {
  it('renders primary variant with charcoal background, not pink accent', () => {
    const { getByRole } = render(<Button>Entrar</Button>);
    const button = getByRole('button');

    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.fg }),
      ])
    );
    expect(button.props.style).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.accent }),
      ])
    );
  });

  it('renders ghost variant with transparent background and border', () => {
    const { getByRole } = render(<Button variant="ghost">Voltar</Button>);
    const button = getByRole('button');

    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'transparent' }),
      ])
    );
  });

  it('fills parent width when block is true', () => {
    const { getByRole } = render(<Button block>Entrar</Button>);
    const button = getByRole('button');

    expect(button.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '100%' })])
    );
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button onPress={onPress}>Entrar</Button>);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button onPress={onPress} disabled>
        Entrar
      </Button>
    );

    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
