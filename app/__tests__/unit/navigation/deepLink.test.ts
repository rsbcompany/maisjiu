import * as SecureStore from 'expo-secure-store';
import {
  clearPendingDeepLink,
  getPendingDeepLink,
  parseDeepLink,
  setPendingDeepLink,
} from '../../../src/navigation/deepLink';

const getItemAsync = jest.mocked(SecureStore.getItemAsync);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);
const deleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);

describe('parseDeepLink', () => {
  it('returns the home route for maisjiu://semana-atual', () => {
    const route = parseDeepLink('maisjiu://semana-atual');

    expect(route).toEqual({ pathname: '/(tabs)' });
  });

  it('returns the player route for maisjiu://video/<id>', () => {
    const route = parseDeepLink('maisjiu://video/abc-123');

    expect(route).toEqual({ pathname: '/player/abc-123' });
  });

  it('returns the search route for maisjiu://buscar without a tag', () => {
    const route = parseDeepLink('maisjiu://buscar');

    expect(route).toEqual({ pathname: '/search' });
  });

  it('returns the search route with a tag param for maisjiu://buscar?tag=', () => {
    const route = parseDeepLink('maisjiu://buscar?tag=Passagem');

    expect(route).toEqual({ pathname: '/search', params: { tag: 'Passagem' } });
  });

  it('returns null for an unknown scheme', () => {
    const route = parseDeepLink('https://example.com/video/abc');

    expect(route).toBeNull();
  });

  it('returns null for an unknown host', () => {
    const route = parseDeepLink('maisjiu://unknown');

    expect(route).toBeNull();
  });

  it('returns null for a malformed URL instead of throwing', () => {
    const route = parseDeepLink('not-a-valid-url');

    expect(route).toBeNull();
  });
});

describe('pending deep link store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves and retrieves a pending route', async () => {
    const route = { pathname: '/player/abc-123' };
    getItemAsync.mockResolvedValue(JSON.stringify(route));

    await setPendingDeepLink(route);
    const pending = await getPendingDeepLink();

    expect(setItemAsync).toHaveBeenCalledWith('pendingDeepLink', JSON.stringify(route));
    expect(pending).toEqual(route);
  });

  it('returns null when there is no pending route', async () => {
    getItemAsync.mockResolvedValue(null);

    const pending = await getPendingDeepLink();

    expect(pending).toBeNull();
  });

  it('returns null and does not throw for corrupted stored data', async () => {
    getItemAsync.mockResolvedValue('not-json');

    const pending = await getPendingDeepLink();

    expect(pending).toBeNull();
  });

  it('clears the pending route', async () => {
    await clearPendingDeepLink();

    expect(deleteItemAsync).toHaveBeenCalledWith('pendingDeepLink');
  });

  it('silently ignores storage write failures', async () => {
    setItemAsync.mockRejectedValue(new Error('SecureStore failed'));

    await expect(setPendingDeepLink({ pathname: '/(tabs)' })).resolves.not.toThrow();
  });
});
