import { render, waitFor } from '@testing-library/react-native';
import { Snackbar } from '@/src/components/Snackbar';

describe('Snackbar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the message when visible', () => {
    const { getByText } = render(<Snackbar message="Entrando..." visible />);
    expect(getByText('Entrando...')).toBeTruthy();
  });

  it('calls onDismiss after the configured duration', async () => {
    const onDismiss = jest.fn();
    render(<Snackbar message="Salvo" visible duration={800} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  it('clears the previous timer when visibility toggles rapidly', async () => {
    const onDismiss = jest.fn();
    const { rerender } = render(
      <Snackbar message="A" visible duration={800} onDismiss={onDismiss} />
    );

    rerender(<Snackbar message="A" visible={false} duration={800} onDismiss={onDismiss} />);
    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  it('hides without calling onDismiss when there is no callback', () => {
    const { rerender } = render(<Snackbar message="A" visible duration={600} />);

    jest.advanceTimersByTime(600);
    rerender(<Snackbar message="A" visible={false} duration={600} />);

    expect(() => jest.advanceTimersByTime(600)).not.toThrow();
  });
});
