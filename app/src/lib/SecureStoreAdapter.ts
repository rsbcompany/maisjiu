import * as SecureStore from 'expo-secure-store';

/**
 * Storage adapter for supabase-js auth sessions using Expo SecureStore.
 * Sessions are encrypted at rest, which satisfies the MVP requirement to keep
 * the refresh token safe for the ~1 month sliding window.
 */
export const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
