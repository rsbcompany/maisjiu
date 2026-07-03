import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthSession } from '@/src/hooks/useAuthSession';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthNavigator />
    </SafeAreaProvider>
  );
}

function AuthNavigator() {
  const { session, isLoading } = useAuthSession();

  if (isLoading) return null;

  return <RootStack isAuthenticated={Boolean(session)} />;
}

function RootStack({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player/[id]" options={{ presentation: 'fullScreenModal' }} />
      </Stack.Protected>
    </Stack>
  );
}
