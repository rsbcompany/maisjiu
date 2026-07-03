import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';

type SessionSetter = (session: Session | null) => void;
type LoadingSetter = (isLoading: boolean) => void;

/**
 * Wires the app to the current Supabase Auth session.
 *
 * - Loads the persisted session on mount.
 * - Listens to auth state changes (sign in, sign out, token refresh).
 * - The refresh token is stored in Expo SecureStore, so the session slides
 *   for the ~1 month window aligned with the content cycle.
 */
export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => subscribeAuthState(setSession, setIsLoading), []);

  return { session, isLoading };
}

function subscribeAuthState(setSession: SessionSetter, setIsLoading: LoadingSetter) {
  let mounted = true;

  void loadInitialSession(setSession, setIsLoading, () => mounted);

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    updateSession(setSession, setIsLoading, session);
  });

  return () => {
    mounted = false;
    data.subscription.unsubscribe();
  };
}

async function loadInitialSession(
  setSession: SessionSetter,
  setIsLoading: LoadingSetter,
  isMounted: () => boolean
) {
  const { data } = await supabase.auth.getSession();
  if (isMounted()) updateSession(setSession, setIsLoading, data.session);
}

function updateSession(
  setSession: SessionSetter,
  setIsLoading: LoadingSetter,
  session: Session | null
) {
  setSession(session);
  setIsLoading(false);
}
