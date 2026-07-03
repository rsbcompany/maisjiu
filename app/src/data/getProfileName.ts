import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';

type DbProfile = { nome: string | null };

/**
 * Reads the authenticated student's display name from `profiles`.
 *
 * RLS restricts the row set to the current user, so `maybeSingle` resolves the
 * caller's own profile. Returns `null` when no profile row exists.
 */
export async function getProfileName(client: SupabaseClient = supabase): Promise<string | null> {
  const { data } = await client.from('profiles').select('nome').maybeSingle();
  return (data as DbProfile | null)?.nome ?? null;
}
