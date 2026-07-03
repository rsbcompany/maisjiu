import { render } from '@testing-library/react-native';
import { Caption } from '@/src/components/Caption';
import { colors } from '@/src/theme/colors';
import { textSizes, tracking } from '@/src/theme/typography';

describe('Caption', () => {
  it('renders mono text with muted color and uppercase transform style', () => {
    const { getByText } = render(<Caption>Semana Atual</Caption>);
    const caption = getByText('Semana Atual');

    expect(caption).toBeTruthy();
    expect(caption.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: colors.muted,
          fontSize: textSizes.xs,
          letterSpacing: tracking.caption,
          textTransform: 'uppercase',
        }),
      ])
    );
  });
});
