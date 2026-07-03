---
status: completed
title: Cliente Supabase, ContentRepository e tela de login
type: frontend
complexity: medium
dependencies:
    - task_02
    - task_05
---

# Task 06: Cliente Supabase, ContentRepository e tela de login

## Overview

Integra o app ao Supabase piloto com sessão persistente (~1 mês), implementa o contrato `ContentRepository` usado pelas telas, e entrega a tela de login com tratamento de erros. Desbloqueia fetch de conteúdo autenticado e o gate de navegação do MVP.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST configure `@supabase/supabase-js` with anon key from env (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- MUST persist auth session in Expo SecureStore with auto-refresh (~1 month aligned to PRD)
- MUST implement `ContentRepository` interface per TechSpec "Core Interfaces" (methods: `getCurrentWeek`, `getVideosForWeek`, `listTags`, `searchVideosByTag`, `recordView`)
- MUST implement login via `auth.signInWithPassword`; no signup/recovery UI
- MUST show login errors for empty fields and invalid credentials per design doc §5 Login states
- MUST gate `(tabs)` routes behind authenticated session in root layout
- MUST map snake_case DB columns to camelCase domain types in repository layer
- MUST mock Supabase client at repository boundary in unit tests (no network)
</requirements>

## Subtasks
- [ ] 6.1 Create Supabase client singleton and SecureStore auth storage adapter
- [ ] 6.2 Implement domain types and `ContentRepository` in `src/data/`
- [ ] 6.3 Implement Supabase-backed repository with PostgREST queries
- [ ] 6.4 Build LoginScreen using task_05 components; wire submit to signIn
- [ ] 6.5 Update root layout auth redirect: session → tabs, no session → login
- [ ] 6.6 Add `.env.example` documenting required public Supabase vars

## Implementation Details

See TechSpec **Core Interfaces**, **API Endpoints**, **Integration Points (Supabase Auth)**. Pilot project: `snjaaejvwlkgmyvgrmro` (see `_techspec.md` Supabase Project section).

Expected paths:
- `src/lib/supabase.ts` — client factory
- `src/data/types.ts` — Week, VideoWithTags, Tag
- `src/data/contentRepository.ts` — interface + Supabase implementation
- `app/login.tsx` — LoginScreen
- `.env.example` — public keys only

LoginScreen reproduz fielmente `prototipo/login.html` (fonte de verdade visual, ADR-007): brand mark "MJ", fields Usuário/Senha, charcoal primary CTA, helper for pré-criadas contas.

### Relevant Files
- `.compozy/tasks/bjj-retention-app/_techspec.md` — ContentRepository contract
- `mcp-supabase-setup.md` — pilot project reference
- `prototipo/design.md` — LoginBody specs (§3, §5)
- `prototipo/login.html` — tela de Login a reproduzir (fonte de verdade visual)

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_07.md` — dashboard calls repository
- `.compozy/tasks/bjj-retention-app/task_09.md` — `recordView` implementation
- `.compozy/tasks/bjj-retention-app/task_10.md` — search uses repository
- `.compozy/tasks/bjj-retention-app/task_11.md` — auth gate + deferred navigation

### Related ADRs
- [ADR-004: Backend e dados — Supabase (BaaS)](../adrs/adr-004.md) — direct client access
- [ADR-005: Autenticação e segurança — Supabase Auth + RLS](../adrs/adr-005.md) — signup disabled
- [ADR-007: Protótipo high-fidelity como fonte de verdade visual](../adrs/adr-007.md) — LoginScreen reproduz `prototipo/login.html`

## Deliverables
- Working Supabase client with SecureStore session persistence
- `ContentRepository` interface and Supabase implementation (read methods complete; `recordView` may stub until task_09)
- LoginScreen with validation and error states
- Auth-protected navigation in root layout
- `.env.example` without secrets
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for auth flow **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Empty username/password shows validation error message
  - [ ] `signInWithPassword` failure maps to "Credenciais inválidas" user message
  - [ ] `getCurrentWeek('2026-07-01')` selects week where date in range (mocked Supabase response)
  - [ ] `getVideosForWeek` maps nested tags and technique fields to `VideoWithTags`
  - [ ] `listTags` returns sorted tag list for chip rendering
  - [ ] Repository uses anon key only (no service role in client module)
- Integration tests:
  - [ ] Successful login mock sets session and redirects to `(tabs)/index`
  - [ ] Expired/no session redirects to login route
  - [ ] Login field input clears displayed error (onChange behavior)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Pilot student account can log in against seeded database
- Session persists across app restart (SecureStore)
- Unauthenticated users cannot access tab routes
