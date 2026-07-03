import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
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

let authCallback: ((event: string, session: Session | null) => void) | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  authCallback = null;
  getSession.mockResolvedValue({ data: { session: null }, error: null } as never);
  onAuthStateChange.mockImplementation(((callback: (event: string, session: Session | null) => void) => {
    authCallback = callback;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  }) as never);
  signInWithPassword.mockResolvedValue({ data: { session: null }, error: null } as never);
});

describe('Auth-gated navigation', () => {
  it('redirects to the login route when there is no session', async () => {
    // Arrange — getSession resolves null (default)
    const screen = renderRouter(routeContext, { initialUrl: '/(tabs)' });

    // Act & Assert — the tab group is never reachable without a session
    expect(await screen.findByText('Mais Jiu')).toBeTruthy();
    await waitFor(() => expect(screen.getPathname()).toBe('/login'));
  });

  it('renders the tab group when a persisted session exists', async () => {
    // Arrange
    getSession.mockResolvedValue({ data: { session: fakeSession }, error: null } as never);

    // Act
    const screen = renderRouter(routeContext, { initialUrl: '/(tabs)' });

    // Assert
    expect((await screen.findAllByText('Início')).length).toBeGreaterThanOrEqual(1);
  });

  it('sets the session and lands on the tabs after a successful login', async () => {
    // Arrange — a successful sign in emits the auth state change with a session
    signInWithPassword.mockImplementation((() => {
      authCallback?.('SIGNED_IN', fakeSession);
      return Promise.resolve({ data: { session: fakeSession }, error: null });
    }) as never);
    const screen = renderRouter(routeContext, { initialUrl: '/login' });
    await screen.findByText('Mais Jiu');

    // Act
    fireEvent.changeText(screen.getByTestId('login-email'), 'aluno@academia.com');
    fireEvent.changeText(screen.getByTestId('login-password'), '123456');
    fireEvent.press(screen.getByTestId('login-submit'));

    // Assert
    expect((await screen.findAllByText('Início')).length).toBeGreaterThanOrEqual(1);
  });
});
