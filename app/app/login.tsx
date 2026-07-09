import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Field, Input, Snackbar } from '@/src/components';
import { colors, fontWeights, radius, space, textSizes } from '@/src/theme';
import { supabase } from '@/src/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  function clearError() {
    setError(null);
  }

  function handleEmailChange(text: string) {
    setEmail(text);
    clearError();
  }

  function handlePasswordChange(text: string) {
    setPassword(text);
    clearError();
  }

  async function handleSubmit() {
    clearError();
    const credentials = getCredentials(email, password);

    if (!credentials) {
      setError('Preencha usuário e senha.');
      return;
    }

    await signIn(credentials);
  }

  async function signIn(credentials: { email: string; password: string }) {
    setIsSubmitting(true);
    setSnackbarVisible(true);

    const { error } = await supabase.auth.signInWithPassword(credentials);

    setSnackbarVisible(false);
    setIsSubmitting(false);

    if (error) {
      setError(mapAuthError(error));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>MJ</Text>
        </View>
        <Text style={styles.title}>Mais Jiu</Text>
        <Text style={styles.subtitle}>Estudo ativo fora do tatame</Text>
      </View>

      <View style={styles.form}>
        <Field label="Usuário" error={error ?? undefined}>
          <Input
            value={email}
            onChangeText={handleEmailChange}
            placeholder="seu.usuario"
            autoComplete="off"
            autoCapitalize="none"
            keyboardType="email-address"
            error={Boolean(error)}
            testID="login-email"
            accessibilityLabel="Usuário"
          />
        </Field>

        <Field label="Senha" error={error ?? undefined}>
          <Input
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="••••••"
            secureTextEntry
            error={Boolean(error)}
            testID="login-password"
            accessibilityLabel="Senha"
          />
        </Field>

        <Button
          block
          onPress={handleSubmit}
          disabled={isSubmitting}
          testID="login-submit"
        >
          Entrar
        </Button>
      </View>

      <Text style={styles.hint}>
        Contas pré-criadas pela academia.{"\n"}
        <Text style={styles.hintAccent}>Dica: aluno / 123456</Text>
      </Text>

      <Snackbar
        message="Entrando..."
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        testID="login-snackbar"
      />
    </View>
  );
}

function getCredentials(email: string, password: string) {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  if (!trimmedEmail || !trimmedPassword) return null;
  return { email: trimmedEmail, password: trimmedPassword };
}

function mapAuthError(_error: unknown) {
  return 'Credenciais inválidas. Tente aluno / 123456.';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space[5],
  },
  brand: {
    alignItems: 'center',
    marginBottom: space[6],
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.fg,
    borderRadius: radius.lg,
    height: 64,
    justifyContent: 'center',
    marginBottom: space[4],
    width: 64,
  },
  brandMarkText: {
    color: colors.textOnDark,
    fontSize: textSizes['2xl'],
    fontWeight: fontWeights.semibold,
  },
  title: {
    color: colors.fg,
    fontSize: textSizes['2xl'],
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.02,
  },
  subtitle: {
    color: colors.muted,
    fontSize: textSizes.base,
    marginTop: space[1],
  },
  form: {
    gap: space[4],
  },
  hint: {
    color: colors.muted,
    fontSize: textSizes.sm,
    marginTop: space[4],
    textAlign: 'center',
  },
  hintAccent: {
    color: colors.meta,
  },
});
