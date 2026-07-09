/**
 * Destination produced by parsing a `maisjiu://` deep link.
 *
 * The pathname uses Expo Router segments:
 * - `/(tabs)` for the current-week dashboard
 * - `/player/:id` for the immersive video player
 * - `/search` for the tag library (optional `tag` query param)
 */
export interface DeepLinkRoute {
  pathname: string;
  params?: Record<string, string>;
}
