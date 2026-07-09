import { useEffect, useRef } from 'react';
import type { Href } from 'expo-router';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useAuthSession } from '@/src/hooks/useAuthSession';
import {
  clearPendingDeepLink,
  getPendingDeepLink,
  parseDeepLink,
  setPendingDeepLink,
} from '@/src/navigation/deepLink';
import type { DeepLinkRoute } from '@/src/navigation/DeepLinkRoute';

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

  useDeepLink(session, isLoading);

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

function useDeepLink(session: ReturnType<typeof useAuthSession>['session'], isLoading: boolean) {
  const router = useRouter();
  const lastSessionRef = useRef(session);

  useEffect(() => {
    if (isLoading) return;

    let mounted = true;
    const subscription = Linking.addEventListener('url', (event) => {
      if (!mounted) return;
      void handleIncomingUrl(event.url, session, router);
    });

    void Linking.getInitialURL().then((url) => {
      if (!mounted || !url) return;
      void handleIncomingUrl(url, session, router);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [session, isLoading, router]);

  useEffect(() => {
    const becameAuthenticated = session && !lastSessionRef.current;
    lastSessionRef.current = session;
    if (!becameAuthenticated) return;

    void resumePendingDestination(router);
  }, [session, router]);
}

async function handleIncomingUrl(
  url: string,
  session: ReturnType<typeof useAuthSession>['session'],
  router: ReturnType<typeof useRouter>
) {
  const route = parseDeepLink(url);
  if (!route) return;

  if (session) {
    navigateToRoute(router, route);
    return;
  }

  await setPendingDeepLink(route);
}

async function resumePendingDestination(router: ReturnType<typeof useRouter>) {
  const route = await getPendingDeepLink();
  if (!route) return;

  navigateToRoute(router, route, true);
  await clearPendingDeepLink();
}

function navigateToRoute(
  router: ReturnType<typeof useRouter>,
  route: DeepLinkRoute,
  replace: boolean = false
) {
  const target = { pathname: route.pathname, params: route.params } as Href;
  if (replace) {
    router.replace(target);
  } else {
    router.navigate(target);
  }
}
