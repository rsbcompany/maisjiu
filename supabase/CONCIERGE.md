# Concierge Operations — Mais Jiu Pilot

This folder contains the operational SQL used by the admin/concierge to manage
content and read success metrics for the pilot project
(`project_ref: snjaaejvwlkgmyvgrmro`).

## Files

| File | Purpose |
|------|---------|
| `seed.sql` | Idempotent content seed: one current week, 8 videos, tags and junction. |
| `metrics/distinct_videos_per_user_week.sql` | Primary metric: avg distinct videos/user/week. |
| `metrics/total_views_per_user_week.sql` | Secondary metric: total view events/user/week. |
| `metrics/distribution.sql` | Consumption distribution (0 / 1-2 / 3+ distinct videos). |
| `metrics/recurrence.sql` | Students active in more than one week. |
| `metrics/pre_post_class.sql` | Pre-class (Mon/Tue) vs post-class share by weekday. |

## Applying the seed

Run `supabase/seed.sql` in the Supabase SQL editor using the **service-role**
key (or any role with write access to `public.weeks`, `public.videos`,
`public.tags` and `public.video_tags`). The script uses fixed UUIDs and
`ON CONFLICT`, so it is safe to re-run whenever content is updated.

```sql
-- Paste the contents of supabase/seed.sql and execute.
```

For local integration tests, the seed is applied automatically by
`npx supabase db reset` when it is referenced by `supabase/config.toml` or
loaded by the test harness.

## Provisioning pilot student accounts

The mobile app uses **Supabase Auth email+password** with signup disabled.
Accounts must be created by the concierge using the Auth admin API or the
Supabase dashboard.

**Do not store plaintext passwords.** Supabase Auth hashes passwords before
persisting them.

### Option A — Supabase Dashboard (recommended for the pilot)

1. Open the Supabase dashboard → Authentication → Users.
2. Click **Add user** → **Create new user**.
3. Fill in the student's email and a temporary password.
4. Copy the generated `user_id` (UUID).
5. Run the snippet below in the SQL editor to link the display name:

```sql
INSERT INTO public.profiles (id, nome)
VALUES ('<USER_ID_FROM_DASHBOARD>', 'Nome do Aluno')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;
```

### Option B — Auth Admin API

Use the service-role key with `supabase.auth.admin.createUser`:

```js
const { data, error } = await supabase.auth.admin.createUser({
  email: 'aluno@academia.exemplo',
  password: 'senha-temporaria-forte',
  email_confirm: true,
});

if (error) throw error;

await supabase
  .from('profiles')
  .upsert({ id: data.user.id, nome: 'Nome do Aluno' });
```

Then share the email and password with the student via the academy's trusted
channel (e.g. WhatsApp).

## Updating a video URL

When the academy delivers the real vertical clips:

1. Replace the placeholder URL in `supabase/seed.sql`.
2. Re-run `supabase/seed.sql` in the SQL editor.
3. Validate that the new URL is reachable (HTTP 200, `video/mp4` or HLS
   playlist) before telling students to open the app.

## Running metrics

Open each file under `supabase/metrics/` in the Supabase SQL editor and run it.
Run the primary metric (`distinct_videos_per_user_week.sql`) weekly during the
~4-week pilot and record the result.

## Notes

- Never commit service-role keys or student passwords to version control.
- `seed.sql` intentionally does not insert rows into `auth.users`; passwords
  must be handled by Supabase Auth.
