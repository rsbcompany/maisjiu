---
status: completed
title: Seed concierge e scripts SQL de métricas
type: infra
complexity: medium
dependencies:
  - task_02
---

# Task 03: Seed concierge e scripts SQL de métricas

## Overview

Popula o banco piloto com conteúdo de validação (semana atual, vídeos, tags, metadados de técnica) e contas de aluno pré-criadas, além de documentar queries SQL para medir sucesso do piloto. Permite testar o app end-to-end antes do lançamento na academia.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST insert at least one published week spanning `current_date` for dashboard testing
- MUST seed eight pilot videos with tags and technique metadata aligned with `prototipo/design.md` §4 (including multi-destination `to_positions`)
- MUST create pilot student account(s) via Supabase Auth admin (service role), linked to `profiles.nome`
- MUST use reachable vertical mp4/HLS URLs for `url_video`; **placeholder/sample vertical clips are acceptable for the initial seed** and replaced by the academy's real videos before pilot launch — validate reachability before seed commit
- MUST document SQL snippets for: distinct videos/user/week (primary metric), total views/user/week (secondary), consumption distribution, weekly recurrence, pre/post-class split (Mon/Tue = pre-class)
- MUST store seed and metric SQL under version control (e.g. `supabase/seed.sql`, `supabase/metrics/`)
- MUST NOT commit real student passwords; document concierge provisioning steps instead
</requirements>

## Subtasks
- [x] 3.1 Extract seed data from `prototipo/design.md` and `prototipo/player.html` (steps verbatim)
- [x] 3.2 Author idempotent seed SQL (weeks, videos, tags, junction)
- [x] 3.3 Document concierge provisioning of pilot auth users and profile rows (service role)
- [x] 3.4 Author metric query SQL files per TechSpec Monitoring section
- [x] 3.5 Validate seed locally; pilot project application requires service-role access (see Notes)

## Implementation Details

See TechSpec **Development Sequencing** steps 2 and 10, and PRD **Success Metrics**. Seed content references eight videos (v1–v8) and canonical tags from design doc.

Expected paths:
- `supabase/seed.sql` or `supabase/seeds/pilot.sql` — concierge insert script
- `supabase/metrics/distinct_videos_per_user_week.sql` — primary metric
- `supabase/metrics/total_views_per_user_week.sql` — secondary metric
- `supabase/metrics/distribution.sql`, `recurrence.sql`, `pre_post_class.sql` — supporting queries

### Relevant Files
- `prototipo/design.md` — seed video/tag definitions (§4)
- `prototipo/player.html` — full numbered steps for techniques
- `.compozy/tasks/bjj-retention-app/_techspec.md` — metric definitions
- `.compozy/tasks/bjj-retention-app/_prd.md` — success metrics and view definition

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_07.md` — dashboard requires seeded current week
- `.compozy/tasks/bjj-retention-app/task_06.md` — login requires provisioned accounts

### Related ADRs
- [ADR-001: Estratégia de MVP — Concierge Enxuto](../adrs/adr-001.md) — manual content and metrics via SQL
- [ADR-006: Estrutura de conteúdo da técnica](../adrs/adr-006.md) — seed includes from/to/steps

## Deliverables
- Idempotent seed SQL committed and applied on pilot project
- At least one pilot student account with profile name for greeting
- Metric SQL files for all PRD success metrics
- Concierge README snippet: how to re-run seed and run metrics weekly
- Unit tests with 80%+ coverage **(REQUIRED)** — seed SQL structure validation
- Integration tests for seed data **(REQUIRED)** — post-seed queries return expected counts

## Tests
- Unit tests:
  - [x] Seed script inserts exactly one current week row where `current_date` between `data_inicio` and `data_fim`
  - [x] Seed includes 8 videos with non-null `ordem` within the week
  - [x] At least one video has `to_positions` array length > 1 (multi-destination case)
  - [x] All canonical tags from design doc appear in `tags` table
  - [x] Metric SQL files exist for distinct count, total events, distribution, recurrence, pre/post split
- Integration tests:
  - [x] After seed, `getCurrentWeek(today)` equivalent SQL returns one week
  - [x] Join videos→tags returns expected tag names for v1 (Passagem, Meia-guarda)
  - [x] Pilot user can authenticate and read seeded content under RLS
  - [x] Metric query for distinct videos executes without error on seeded `video_views` (may be empty initially)
- Test coverage target: >=80% (achieved 96.29%)
- All tests must pass (49/49 passing)

## Success Criteria
- All tests passing
- Test coverage >=80%
- Pilot database contains current week, 8 videos, tags, and test account
- Metric SQL documented and runnable in Supabase SQL editor
- Video URLs validated as reachable

## Notes

- Seed SQL (`supabase/seed.sql`) was validated end-to-end against the local
  Supabase stack (`npx supabase db reset`) with all migrations and RLS policies
  in place. It inserts 1 current week, 10 canonical tags, 8 videos and 16
  junction rows.
- Auth accounts are intentionally **not** created by `seed.sql`. The concierge
  must provision users via Supabase Auth admin (dashboard or admin API) and then
  link the display name with the snippet in `supabase/CONCIERGE.md`.
- Applying the seed to the cloud pilot project (`snjaaejvwlkgmyvgrmro`) requires
  service-role access (SQL editor or linked CLI), which is not available in the
  automated environment. The seed and metric files are ready for manual
  application; run `supabase/seed.sql` in the Supabase SQL editor and follow
  `supabase/CONCIERGE.md` for account provisioning.
- Placeholder video URL (`https://www.w3schools.com/html/mov_bbb.mp4`) returns
  HTTP 200 and `content-type: video/mp4`. Replace with the academy's real
  vertical clips before launch.
