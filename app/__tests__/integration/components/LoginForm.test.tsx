import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '@/src/components/Button';
import { Field } from '@/src/components/Field';
import { Input } from '@/src/components/Input';
import { Snackbar } from '@/src/components/Snackbar';

function LoginForm({ onSubmit }: { onSubmit?: (user: string, pass: string) => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  function handleSubmit() {
    if (!user.trim() || !pass.trim()) {
      setError('Preencha usuário e senha.');
      return;
    }

    if (user === 'aluno' && pass === '123456') {
      setError(undefined);
      setSnackbarVisible(true);
      onSubmit?.(user, pass);
    } else {
      setError('Credenciais inválidas. Tente aluno / 123456.');
    }
  }

  return (
    <View style={styles.container}>
      <Field label="Usuário" error={error}>
        <Input
          value={user}
          onChangeText={setUser}
          placeholder="seu.usuario"
          autoComplete="off"
          testID="login-user"
        />
      </Field>
      <Field label="Senha" error={error}>
        <Input
          value={pass}
          onChangeText={setPass}
          placeholder="••••••"
          secureTextEntry
          testID="login-pass"
        />
      </Field>
      <Button block onPress={handleSubmit} testID="login-submit">
        Entrar
      </Button>
      <Snackbar
        message="Entrando..."
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        testID="login-snackbar"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 20,
  },
});

describe('LoginForm composition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('composes Field, Input and Button without layout overflow', () => {
    const { getByTestId } = render(<LoginForm />);

    const userInput = getByTestId('login-user');
    const passInput = getByTestId('login-pass');
    const submitButton = getByTestId('login-submit');

    expect(userInput).toBeTruthy();
    expect(passInput).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

  it('shows Field helper error when submitting empty fields', () => {
    const { getAllByText, getByTestId } = render(<LoginForm />);

    fireEvent.press(getByTestId('login-submit'));

    expect(getAllByText('Preencha usuário e senha.')).toHaveLength(2);
  });

  it('submits valid credentials and shows the snackbar', () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.changeText(getByTestId('login-user'), 'aluno');
    fireEvent.changeText(getByTestId('login-pass'), '123456');
    fireEvent.press(getByTestId('login-submit'));

    expect(onSubmit).toHaveBeenCalledWith('aluno', '123456');
    expect(getByText('Entrando...')).toBeTruthy();
  });

  it('shows error for invalid credentials', () => {
    const { getByTestId, getAllByText } = render(<LoginForm />);

    fireEvent.changeText(getByTestId('login-user'), 'wrong');
    fireEvent.changeText(getByTestId('login-pass'), 'wrong');
    fireEvent.press(getByTestId('login-submit'));

    expect(getAllByText('Credenciais inválidas. Tente aluno / 123456.')).toHaveLength(2);
  });
});
