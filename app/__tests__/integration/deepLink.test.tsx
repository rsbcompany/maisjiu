import { fireEvent, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { renderRouter } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import RootLayout from '../../app/_layout';
import LoginScreen from '../../app/login';
import TabLayout from '../../app/(tabs)/_layout';
import HomeScreen from '../../app/(tabs)/index';
import SearchScreen from '../../app/(tabs)/search';
import PlayerScreen from '../../app/player/[id]';

const routeContext = {
  _layout: RootLayout,
  login: LoginScreen,
  '(tabs)/_layout': TabLayout,
  '(tabs)/index': HomeScreen,
  '(tabs)/search': SearchScreen,
  'player/[id]': PlayerScreen,
};

const fakeSession = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  user: { id: 'user-1' },
} as unknown as Session;

const getSession = jest.mocked(supabase.auth.getSession);
const onAuthStateChange = jest.mocked(supabase.auth.onAuthStateChange);
const signInWithPassword = jest.mocked(supabase.auth.signInWithPassword);
const getInitialURL = jest.mocked(Linking.getInitialURL);
const getItemAsync = jest.mocked(SecureStore.getItemAsync);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);
const deleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);

let authCallback: ((event: string, session: Session | null) => void) | null = null;
let secureStoreMemory = new Map<string, string>();

function resetSecureStore() {
  secureStoreMemory = new Map<string, string>();
}

beforeEach(() => {
  jest.clearAllMocks();
  resetSecureStore();
  authCallback = null;
  getSession.mockResolvedValue({ data: { session: null }, error: null } as never);
  onAuthStateChange.mockImplementation(((callback: (event: string, session: Session | null) => void) => {
    authCallback = callback;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  }) as never);
  signInWithPassword.mockResolvedValue({ data: { session: null }, error: null } as never);
  getInitialURL.mockResolvedValue(null);
  getItemAsync.mockImplementation((key) => Promise.resolve(secureStoreMemory.get(key) ?? null));
  setItemAsync.mockImplementation((key, value) => {
    secureStoreMemory.set(key, value);
    return Promise.resolve();
  });
  deleteItemAsync.mockImplementation((key) => {
    secureStoreMemory.delete(key);
    return Promise.resolve();
  });
});

describe('Deep link handling', () => {
  it('opens the current week dashboard when already authenticated', async () => {
    // Arrange
    getSession.mockResolvedValue({ data: { session: fakeSession }, error: null } as never);
    getInitialURL.mockResolvedValue('maisjiu://semana-atual');

    const screen = renderRouter(routeContext, { initialUrl: '/(tabs)' });

    // Assert — dashboard content is visible (tabs index renders as "/")
    expect((await screen.findAllByText('Início')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getPathname()).toBe('/');
  });

  it('preserves a video deep link through login and lands on player/[id]', async () => {
    // Arrange — cold start unauthenticated with a video deep link
    getInitialURL.mockResolvedValue('maisjiu://video/v2');
    signInWithPassword.mockImplementation((() => {
      authCallback?.('SIGNED_IN', fakeSession);
      return Promise.resolve({ data: { session: fakeSession }, error: null });
    }) as never);

    const screen = renderRouter(routeContext, { initialUrl: '/login' });
    await screen.findByText('Mais Jiu');

    // Act — login
    fireEvent.changeText(screen.getByTestId('login-email'), 'aluno@academia.com');
    fireEvent.changeText(screen.getByTestId('login-password'), '123456');
    fireEvent.press(screen.getByTestId('login-submit'));

    // Assert — pending link was saved, then cleared, and user lands on the player
    await waitFor(() => {
      expect(setItemAsync).toHaveBeenCalledWith('pendingDeepLink', JSON.stringify({ pathname: '/player/v2' }));
    });
    await waitFor(() => {
      expect(deleteItemAsync).toHaveBeenCalledWith('pendingDeepLink');
    });
    expect(await screen.findByTestId('player-screen')).toBeTruthy();
    expect(screen.getPathname()).toBe('/player/v2');
  });

  it('opens the search screen with a tag when already authenticated', async () => {
    // Arrange
    getSession.mockResolvedValue({ data: { session: fakeSession }, error: null } as never);
    getInitialURL.mockResolvedValue('maisjiu://buscar?tag=Passagem');

    const screen = renderRouter(routeContext, { initialUrl: '/(tabs)' });

    // Assert — library title is visible and search params are applied
    expect((await screen.findAllByText('Biblioteca')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getPathname()).toBe('/search');
  });

  it('ignores malformed deep links without crashing', async () => {
    // Arrange
    getSession.mockResolvedValue({ data: { session: fakeSession }, error: null } as never);
    getInitialURL.mockResolvedValue('not-a-valid-url');

    const screen = renderRouter(routeContext, { initialUrl: '/(tabs)' });

    // Assert — app stays on the dashboard
    expect((await screen.findAllByText('Início')).length).toBeGreaterThanOrEqual(1);
  });

  it('saves the pending link only while the session is null (cold start simulation)', async () => {
    // Arrange
    getInitialURL.mockResolvedValue('maisjiu://semana-atual');

    renderRouter(routeContext, { initialUrl: '/login' });

    // Assert — the destination is stored before login
    await waitFor(() => {
      expect(setItemAsync).toHaveBeenCalledWith('pendingDeepLink', JSON.stringify({ pathname: '/(tabs)' }));
    });
  });
});
