import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import type { DeepLinkRoute } from './DeepLinkRoute';

const PENDING_DEEP_LINK_KEY = 'pendingDeepLink';
const HOME_PATHNAME = '/(tabs)';
const PLAYER_PATHNAME = '/player';
const SEARCH_PATHNAME = '/search';
const SCHEME = 'maisjiu';

/**
 * Parses a `maisjiu://` URL into an Expo Router route.
 *
 * Supported formats:
 * - `maisjiu://semana-atual` → current week dashboard
 * - `maisjiu://video/<id>` → immersive player for the given video
 * - `maisjiu://buscar?tag=<nome>` → search library filtered by tag
 *
 * Malformed or unknown URLs return `null` instead of throwing.
 */
export function parseDeepLink(url: string): DeepLinkRoute | null {
  try {
    const parsed = Linking.parse(url);
    if (parsed.scheme !== SCHEME) return null;

    const host = parsed.hostname ?? '';
    const path = parsed.path ?? '';

    return buildRoute(host, path, parsed.queryParams);
  } catch {
    return null;
  }
}

function buildRoute(
  host: string,
  path: string,
  queryParams: Linking.QueryParams | null
): DeepLinkRoute | null {
  if (host === 'semana-atual') return { pathname: HOME_PATHNAME };
  if (host === 'video') return buildPlayerRoute(path);
  if (host === 'buscar') return buildSearchRoute(queryParams);
  return null;
}

function buildPlayerRoute(videoId: string): DeepLinkRoute | null {
  const trimmedId = videoId.trim();
  if (!trimmedId) return null;
  return { pathname: `${PLAYER_PATHNAME}/${trimmedId}` };
}

function buildSearchRoute(queryParams: Linking.QueryParams | null): DeepLinkRoute | null {
  const tag = queryParams?.tag;
  const params = typeof tag === 'string' ? { tag } : undefined;
  return { pathname: SEARCH_PATHNAME, params };
}

/** Reads the destination saved for post-login resume, if any. */
export async function getPendingDeepLink(): Promise<DeepLinkRoute | null> {
  try {
    const raw = await SecureStore.getItemAsync(PENDING_DEEP_LINK_KEY);
    if (!raw) return null;
    return parseStoredRoute(raw);
  } catch {
    return null;
  }
}

function parseStoredRoute(raw: string): DeepLinkRoute | null {
  try {
    const parsed = JSON.parse(raw) as DeepLinkRoute;
    if (!parsed.pathname || typeof parsed.pathname !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Saves a destination so it can be resumed after the user logs in. */
export async function setPendingDeepLink(route: DeepLinkRoute): Promise<void> {
  try {
    await SecureStore.setItemAsync(PENDING_DEEP_LINK_KEY, JSON.stringify(route));
  } catch {
    // Deep-link resume is best-effort; never crash the app on storage failure.
  }
}

/** Clears any saved destination. Called after successful navigation. */
export async function clearPendingDeepLink(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PENDING_DEEP_LINK_KEY);
  } catch {
    // Fail silently.
  }
}
