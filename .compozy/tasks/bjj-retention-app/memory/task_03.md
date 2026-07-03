# Task Memory: task_03.md

## Objective Snapshot

Create idempotent concierge seed SQL and metric query SQL for the Mais Jiu pilot,
plus tests. Seed must include a current week, 8 videos with technique metadata,
canonical tags and video/tag junction. Auth account provisioning is documented
but handled outside the seed via Supabase Auth admin.

## Important Decisions

- Used fixed UUIDs for week and videos so `supabase/seed.sql` is idempotent and
  safe to re-run with `ON CONFLICT ... DO UPDATE`.
- Auth users are NOT inserted by `seed.sql`; passwords must be hashed by
  Supabase Auth. Account creation steps live in `supabase/CONCIERGE.md`.
- Placeholder video URL is `https://www.w3schools.com/html/mov_bbb.mp4`
  (HTTP 200, `video/mp4`); real vertical clips replace it before launch.
- Metric queries live under `supabase/metrics/` covering all PRD success
  metrics: distinct videos/user/week (primary), total views/user/week,
  distribution, recurrence, pre/post-class split.

## Learnings

- Adding `seed.sql` to `supabase/seed.sql` makes `supabase db reset` apply it
  automatically, which broke the existing RLS integration test that inserted
  a hard-coded tag (`Meia-guarda`). Fixed by using a unique test tag
  (`Meia-guarda-rls-test`).
- `npx supabase db reset` can take >5 min in this environment; subsequent test
  runs reuse the already running local stack.

## Files / Surfaces

- `supabase/seed.sql` — idempotent pilot content seed.
- `supabase/metrics/distinct_videos_per_user_week.sql` — primary metric.
- `supabase/metrics/total_views_per_user_week.sql` — secondary metric.
- `supabase/metrics/distribution.sql` — consumption distribution.
- `supabase/metrics/recurrence.sql` — weekly recurrence.
- `supabase/metrics/pre_post_class.sql` — pre/post-class weekday split.
- `supabase/CONCIERGE.md` — provisioning and re-run instructions.
- `tests/unit/seed.test.js` — seed structure unit tests.
- `tests/integration/seed.apply.test.js` — seed data + metrics integration tests.
- `tests/integration/rls.policies.test.js` — adjusted unique tag name.
- `logs/test-task03.log`, `logs/coverage-task03.log` — verification outputs.

## Errors / Corrections

- RLS integration test failed on duplicate tag after seed.sql was introduced.
  Corrected by changing the test tag to a unique value.

## Ready for Next Run

- Apply `supabase/seed.sql` to the cloud pilot project via Supabase SQL editor
  (service role) when credentials are available.
- Provision at least one pilot student account following `supabase/CONCIERGE.md`
  and link `profiles.nome` for the dashboard greeting.
