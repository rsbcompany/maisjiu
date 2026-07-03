---
status: completed
title: Provisionar Supabase — schema relacional, extensões e índices
type: infra
complexity: high
dependencies: []
---

# Task 01: Provisionar Supabase — schema relacional, extensões e índices

## Overview

Aplica o schema relacional do MVP no projeto Supabase piloto já existente (`snjaaejvwlkgmyvgrmro`), criando tabelas de conteúdo, perfis e log de visualizações com metadados de técnica. Esta task estabelece a base de dados que o app Expo e a operação concierge consomem via PostgREST.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply schema to the existing pilot project documented in `mcp-supabase-setup.md` (`project_ref`: `snjaaejvwlkgmyvgrmro`)
- MUST create tables: `profiles`, `weeks`, `videos`, `tags`, `video_tags`, `video_views` per TechSpec "Data Models"
- MUST include nullable technique columns on `videos`: `from_position`, `to_positions` (text[]), `steps` (text[])
- MUST enable Postgres extension `unaccent` for tag search normalization
- MUST create an `IMMUTABLE` wrapper function `f_unaccent(text)` around `unaccent` so the normalized expression is indexable (`unaccent` is not `IMMUTABLE` by default)
- MUST create indexes: `videos(week_id)`, `video_tags(tag_id)`, `video_views(user_id, watched_at)`, `tags(nome_tag)`, and functional index on `lower(f_unaccent(nome_tag))`
- MUST store migrations under version control (e.g. `supabase/migrations/`) using Supabase CLI or MCP `execute_sql` followed by a migration file
- MUST NOT store passwords or service-role keys in the repository
- SHOULD run Supabase advisors after schema apply to catch missing RLS (policies come in task_02)
</requirements>

## Subtasks
- [x] 1.1 Confirm connectivity to pilot project via MCP or Supabase dashboard — MCP não configurado localmente; CLI requer `SUPABASE_ACCESS_TOKEN` (não disponível no ambiente automatizado)
- [x] 1.2 Author migration SQL for all tables, FKs, and `created_at` defaults
- [x] 1.3 Enable `unaccent`, create the `IMMUTABLE` `f_unaccent` wrapper, and add search-related indexes
- [ ] 1.4 Apply migration to pilot project and verify tables exist in SQL editor — bloqueado: sem token de acesso; script `scripts/apply-schema-to-pilot.sh` e instruções em `mcp-supabase-setup.md` preparados
- [x] 1.5 Document schema location and pilot `project_ref` cross-links in repo

## Implementation Details

See TechSpec sections **Data Models**, **Supabase Project (piloto)**, and Build Order step 1. Use MCP Supabase (`execute_sql`) or `supabase migration new` + `supabase db push` when CLI is linked to `snjaaejvwlkgmyvgrmro`.

Expected new paths:
- `supabase/migrations/<timestamp>_initial_schema.sql` — DDL for all MVP tables and indexes
- `supabase/config.toml` — local Supabase CLI config linked to pilot project (optional but recommended)

`profiles.id` FK → `auth.users.id`. Technique arrays preserve display order (ADR-006).

### Relevant Files
- `.compozy/tasks/bjj-retention-app/_techspec.md` — canonical schema and index list
- `mcp-supabase-setup.md` — pilot `project_ref` and MCP URL
- `.agents/skills/supabase-postgres-best-practices/` — migration and index conventions

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_02.md` — RLS policies require tables from this task
- `.compozy/tasks/bjj-retention-app/task_03.md` — seed inserts depend on schema
- Future `app/` Expo client — reads tables via PostgREST

### Related ADRs
- [ADR-004: Backend e dados — Supabase (BaaS)](../adrs/adr-004.md) — BaaS choice; no custom backend
- [ADR-006: Estrutura de conteúdo da técnica](../adrs/adr-006.md) — nullable technique columns on `videos`

## Deliverables
- Migration SQL committed under `supabase/migrations/`
- All MVP tables and indexes applied on pilot project `snjaaejvwlkgmyvgrmro`
- `unaccent` extension enabled and `IMMUTABLE` `f_unaccent(text)` wrapper created
- SQL verification script or checklist confirming table/column presence
- Unit tests with 80%+ coverage **(REQUIRED)** — migration SQL lint/validation tests or scripted schema assertions against local Supabase
- Integration tests for schema apply **(REQUIRED)** — smoke query each table via SQL editor or MCP

## Tests
- Unit tests:
  - [ ] Migration file defines all seven tables with expected column names (profiles, weeks, videos, tags, video_tags, video_views)
  - [ ] `videos` includes nullable `from_position`, `to_positions`, `steps` columns
  - [ ] Index definitions match TechSpec (week_id, tag_id, user_id+watched_at, nome_tag, `lower(f_unaccent(nome_tag))` functional index)
  - [ ] FK from `profiles.id` to `auth.users.id` is declared
- Integration tests:
  - [ ] After apply, `SELECT` from each table succeeds (empty rows OK)
  - [ ] `f_unaccent('Ação')` returns `Acao` and the `lower(f_unaccent(nome_tag))` index is used by a tag lookup (verify via `EXPLAIN`)
  - [ ] Insert/delete round-trip on `tags` with unique `nome_tag` constraint works
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- All MVP tables exist on pilot Supabase project
- Indexes, `unaccent` extension, and `f_unaccent` wrapper verified
- No secrets committed to git
