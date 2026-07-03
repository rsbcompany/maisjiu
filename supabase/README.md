# Supabase Configuration — Mais Jiu

This folder holds migrations and operational notes for the Mais Jiu Supabase
project (`project_ref: snjaaejvwlkgmyvgrmro`).

## Auth configuration

The mobile app uses Supabase Auth with **email + password only**. Accounts are
provisioned by the concierge/admin; students cannot sign up themselves.

Required dashboard settings:

| Setting | Value | Where |
|---------|-------|-------|
| Enable email provider | ON | Authentication → Providers → Email |
| Confirm email | OFF | Authentication → Providers → Email |
| Public signup | DISABLED | Authentication → Providers → Email |
| Password recovery | DISABLED | Authentication → Providers → Email |
| Refresh token lifetime | ~30 days | Authentication → Sessions |
| JWT expiry | 1 hour | Authentication → Sessions |

These settings are also reflected in `supabase/config.toml` for local
development:

```toml
[auth]
enable_signup = false
jwt_expiry = 3600
enable_refresh_token_rotation = true

[auth.email]
enable_signup = false
enable_confirmations = false
```

The mobile client stores the refresh token in Expo SecureStore and relies on
`supabase-js` auto-refresh, giving students ~1 month of persisted session across
app opens.

## Row Level Security

RLS is enabled and forced on every application table in `public`:

- `profiles` — students can read only their own row.
- `weeks`, `videos`, `tags`, `video_tags` — students can read all published
  content; no writes are allowed.
- `video_views` — students can insert and read only rows where
  `user_id = auth.uid()`.

Policies live in `supabase/migrations/20260703150033_rls_policies.sql`.
Concierge content/admin writes use the service-role key in the Supabase SQL
editor, never in the mobile client.

## Applying changes

For local integration tests:

```bash
npx supabase start      # first time only
npx supabase db reset   # reapply migrations + seed
```

For the pilot project, apply migrations via the Supabase CLI or MCP after the
schema from task_01 is in place.


## Connnect DB

```
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
```
