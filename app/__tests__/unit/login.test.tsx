import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { supabase } from '@/src/lib/supabase';
import LoginScreen from '../../app/login';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const signInWithPassword = jest.mocked(supabase.auth.signInWithPassword);

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    signInWithPassword.mockResolvedValue({ data: { session: null }, error: null } as never);
  });

  it('shows a validation error when username and password are empty', () => {
    // Arrange
    const { getByTestId, getAllByText } = render(<LoginScreen />);

    // Act
    fireEvent.press(getByTestId('login-submit'));

    // Assert — helper is shown on both fields
    expect(getAllByText('Preencha usuário e senha.')).toHaveLength(2);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('maps a signInWithPassword failure to the "Credenciais inválidas" message', async () => {
    // Arrange
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    } as never);
    const { getByTestId, getAllByText } = render(<LoginScreen />);

    // Act
    fireEvent.changeText(getByTestId('login-email'), 'aluno@academia.com');
    fireEvent.changeText(getByTestId('login-password'), 'wrong-pass');
    fireEvent.press(getByTestId('login-submit'));

    // Assert
    await waitFor(() => {
      expect(getAllByText('Credenciais inválidas. Tente aluno / 123456.')).toHaveLength(2);
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('clears the displayed error when a field changes (onChange behavior)', () => {
    // Arrange
    const { getByTestId, queryAllByText } = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-submit'));
    expect(queryAllByText('Preencha usuário e senha.')).toHaveLength(2);

    // Act
    fireEvent.changeText(getByTestId('login-email'), 'a');

    // Assert
    expect(queryAllByText('Preencha usuário e senha.')).toHaveLength(0);
  });

  it('redirects to the tabs group after a successful sign in', async () => {
    // Arrange
    signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 't' } },
      error: null,
    } as never);
    const { getByTestId } = render(<LoginScreen />);

    // Act
    fireEvent.changeText(getByTestId('login-email'), 'aluno@academia.com');
    fireEvent.changeText(getByTestId('login-password'), '123456');
    fireEvent.press(getByTestId('login-submit'));

    // Assert
    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'aluno@academia.com',
        password: '123456',
      });
    });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
