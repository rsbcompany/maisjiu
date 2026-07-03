import { createClient } from '@supabase/supabase-js';
import { SecureStoreAdapter } from './SecureStoreAdapter';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Singleton Supabase client for the Expo app.
 *
 * - Uses the public anon key only (no service role).
 * - Persists the auth session in Expo SecureStore.
 * - Auto-refreshes the access token so the session slides on each open.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
