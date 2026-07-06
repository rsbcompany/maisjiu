---
status: completed
title: Políticas RLS e configuração Supabase Auth
type: infra
complexity: medium
dependencies:
  - task_01
---

# Task 02: Políticas RLS e configuração Supabase Auth

## Overview

Configura autenticação email/senha com cadastro desabilitado e aplica Row Level Security para isolar dados por aluno. Garante que conteúdo publicado seja legível por usuários autenticados e que eventos de visualização só possam ser inseridos/lidos pelo próprio aluno.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST enable RLS on every application table in `public` exposed to the Data API
- MUST allow authenticated users to SELECT content tables: `weeks`, `videos`, `tags`, `video_tags`, and own row in `profiles`
- MUST allow authenticated users to INSERT into `video_views` only when `user_id = auth.uid()`
- MUST allow authenticated users to SELECT from `video_views` only for rows where `user_id = auth.uid()`
- MUST disable public signup and password recovery in Supabase Auth dashboard (concierge-provisioned accounts only)
- MUST grant `anon`/`authenticated` only required table privileges per Data API settings
- MUST run Supabase security advisors after policy apply and resolve critical findings
- MUST NOT expose service-role key to the mobile client
</requirements>

## Subtasks
- [x] 2.1 Enable RLS on all MVP tables from task_01
- [x] 2.2 Write SELECT policies for content tables (authenticated read)
- [x] 2.3 Write INSERT/SELECT policies for `video_views` scoped to `auth.uid()`
- [x] 2.4 Configure Auth: signup off, email+password on, session refresh compatible with ~1 month client persistence
- [x] 2.5 Verify policies with test JWT contexts (authenticated student vs anon)

## Implementation Details

See TechSpec **API Endpoints**, **Integration Points (Supabase Auth)**, and ADR-005. Policies live in a dedicated migration e.g. `supabase/migrations/<timestamp>_rls_policies.sql`.

Content is read-only for students via RLS; concierge writes use service role in SQL editor (out-of-app).

### Relevant Files
- `supabase/migrations/` — task_01 schema migration(s)
- `.compozy/tasks/bjj-retention-app/_techspec.md` — RLS behavior summary
- `.compozy/tasks/bjj-retention-app/adrs/adr-005.md` — auth and RLS decision
- `.agents/skills/supabase-postgres-best-practices/references/security-rls-basics.md` — RLS patterns

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_03.md` — seed and account provisioning
- `.compozy/tasks/bjj-retention-app/task_06.md` — client auth and `recordView` depend on policies
- `.compozy/tasks/bjj-retention-app/task_09.md` — view insert enforced by RLS

### Related ADRs
- [ADR-005: Autenticação e segurança — Supabase Auth + RLS](../adrs/adr-005.md) — signup disabled; per-student isolation

## Deliverables
- RLS migration SQL committed under `supabase/migrations/`
- Auth dashboard settings documented (signup disabled) in concierge runbook or README snippet
- Security advisor report clean of critical RLS gaps
- Unit tests with 80%+ coverage **(REQUIRED)** — policy SQL file structure tests
- Integration tests for RLS **(REQUIRED)** — authenticated insert/read on `video_views`; anon blocked

## Tests
- Unit tests:
  - [x] Migration enables RLS on `profiles`, `weeks`, `videos`, `tags`, `video_tags`, `video_views`
  - [x] `video_views` INSERT policy references `auth.uid()` in WITH CHECK
  - [x] Content tables have SELECT policy for `authenticated` role
  - [x] No policy grants UPDATE/DELETE on content to students
- Integration tests:
  - [x] Authenticated user can SELECT current week and videos
  - [x] Authenticated user can INSERT `video_views` for self; cannot set arbitrary `user_id`
  - [x] Anonymous role cannot INSERT into `video_views`
  - [x] Authenticated user cannot SELECT another user's `video_views` rows
- Test coverage target: >=80% (achieved 96.29%)
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- RLS enabled on all MVP tables with policies matching ADR-005
- Signup disabled in Supabase Auth
- Security advisors show no critical issues for RLS
