# Task Memory: task_02.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Implement RLS policies and Supabase Auth configuration for Mais Jiu MVP:
- Enable RLS on all six MVP tables and force RLS for defense in depth.
- Authenticated SELECT on content tables (`weeks`, `videos`, `tags`, `video_tags`) and own `profiles` row.
- Authenticated INSERT/SELECT on `video_views` scoped to `auth.uid()`.
- Disable public signup / password recovery; document dashboard settings.
- Unit tests (migration SQL structure) and integration tests (RLS behavior against local Supabase).

## Important Decisions

- RLS migration created via `npx supabase migration new rls_policies` → `supabase/migrations/20260703150033_rls_policies.sql`.
- Used `(select auth.uid())` in policies per Supabase security skill recommendations.
- Explicit `REVOKE` of UPDATE/DELETE/INSERT on content tables and UPDATE/DELETE on `video_views` from `authenticated` for defense in depth.
- Auth dashboard settings documented in `supabase/README.md` (signup disabled, email provider, refresh token ~1 month).

## Learnings

- `extractPolicy` regex must use non-greedy capture for the `TO` clause and terminate on `;`, otherwise `using`/`with check` keywords can be swallowed by the role capture.
- `hasGrant`/`hasRevoke` regex must allow privilege lists like `grant select, insert on ...` rather than assuming a single privilege.
- Running multiple integration suites that each call `supabase db reset` in parallel causes Docker container-removal conflicts. Fixed by adding `--runInBand` to `test:coverage`.

## Files / Surfaces

- `supabase/migrations/20260703150033_rls_policies.sql` — new RLS migration.
- `supabase/README.md` — Auth dashboard configuration and RLS overview.
- `tests/helpers/migration.js` — added `readRlsMigration`, `hasRlsEnabled`, `extractPolicy`, `hasGrant`, `hasRevoke`.
- `tests/unit/migration.rls.test.js` — new unit tests for RLS migration structure.
- `tests/integration/rls.policies.test.js` — new integration tests for RLS behavior.
- `package.json` — `test:coverage` now uses `--runInBand`.

## Errors / Corrections

- Unit test regex initially failed to parse policies and grant lists; corrected helper regexes (non-greedy `TO` capture and privilege-list matching).
- Coverage run initially failed due to parallel `supabase db reset` conflicts; corrected `test:coverage` script to use `--runInBand`.

## Ready for Next Run

- Task is complete pending final verification and tracking-file updates.
- No open blockers.
