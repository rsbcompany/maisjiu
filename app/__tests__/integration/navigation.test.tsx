import { renderRouter, testRouter } from 'expo-router/testing-library';
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

beforeEach(() => {
  jest.clearAllMocks();
  getSession.mockResolvedValue({ data: { session: null }, error: null } as never);
});

describe('MVP route registration', () => {
  it('renders the login route for an unauthenticated session', async () => {
    const { findByText, getPathname } = renderRouter(routeContext, {
      initialUrl: '/login',
    });

    expect(await findByText('Mais Jiu')).toBeTruthy();
    expect(getPathname()).toBe('/login');
  });

  it('navigates to (tabs)/index and (tabs)/search without crash', async () => {
    getSession.mockResolvedValue({ data: { session: fakeSession }, error: null } as never);
    const { findAllByText, getAllByText, getByLabelText } = renderRouter(routeContext, {
      initialUrl: '/(tabs)',
    });

    expect((await findAllByText('Início')).length).toBeGreaterThanOrEqual(1);
    expect(getByLabelText(/Início, tab/)).toBeTruthy();

    testRouter.navigate('/search');
    expect(getAllByText('Buscar').length).toBeGreaterThanOrEqual(1);
    expect(getByLabelText(/Buscar, tab/)).toBeTruthy();
  });

  it('navigates to player/[id] and hides the tab bar', async () => {
    getSession.mockResolvedValue({ data: { session: fakeSession }, error: null } as never);
    const { findAllByText, getByTestId, queryByText } = renderRouter(routeContext, {
      initialUrl: '/(tabs)',
    });

    await findAllByText('Início');
    testRouter.push('/player/v2');

    expect(getByTestId('player-screen')).toBeTruthy();
    expect(queryByText('Buscar')).toBeNull();
  });
});
