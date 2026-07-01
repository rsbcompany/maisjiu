---
status: pending
title: Scaffold Expo com Expo Router e shell de navegação
type: frontend
complexity: medium
dependencies: []
---

# Task 04: Scaffold Expo com Expo Router e shell de navegação

## Overview

Inicializa o app mobile Expo (TypeScript, Android-first) com Expo Router e a árvore de navegação do MVP: login de entrada, tabs Início/Buscar, e rota imersiva do player sem tab bar. Estabelece a estrutura de pastas que as tasks de UI e dados preenchem.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST create Expo app with TypeScript template at repository root or `app/` package per monorepo convention
- MUST use Expo Router (file-based) with native stack for auth gating
- MUST define routes: login (`app/login.tsx` or `(auth)/login`), tab group `(tabs)/index` (Início), `(tabs)/search` (Buscar), immersive `app/player/[id].tsx`
- MUST hide tab bar on player route (full-bleed immersive screen)
- MUST configure Android-first in `app.json` (package name, orientation portrait)
- MUST add Jest + React Native Testing Library baseline for future unit tests
- MUST set up the integration test harness: Jest running against a local Supabase stack (`supabase start` via CLI/Docker), with `supabase db reset` seeding between runs (see TechSpec "Integration Tests")
- MUST add npm scripts for unit and integration layers (e.g. `test:unit`, `test:integration`)
- MUST NOT scaffold end-to-end tooling (Maestro/Detox) — E2E is deferred to Phase 2 (see TechSpec "Integration Tests")
- MUST add placeholder screens (minimal) for each route to enable navigation smoke
- SHOULD follow native navigators guidance from project React Native skills (native stack, not JS stack)
</requirements>

## Subtasks
- [ ] 4.1 Initialize Expo project with TypeScript and Expo Router
- [ ] 4.2 Configure root layout with auth redirect skeleton (session check stub OK)
- [ ] 4.3 Implement bottom tabs (Início, Buscar) with 56px height styling per design doc
- [ ] 4.4 Add player stack route outside tabs with `headerShown: false`
- [ ] 4.5 Verify Android dev build launches and navigates between placeholder screens

## Implementation Details

See TechSpec **Component Overview (Expo Mobile App)**, PRD **User Experience (Navegação)**, and `prototipo/design.md` §6 (estrutura de arquivos sugerida). Align folder layout with design doc:

```
app/
  _layout.tsx
  login.tsx
  (tabs)/_layout.tsx, index.tsx, search.tsx
  player/[id].tsx
```

Dependencies to install: `expo-router`, `react-native-safe-area-context`, `react-native-screens`, `@react-navigation/native` (via Expo).

### Relevant Files
- `prototipo/design.md` — navigation flow diagram and tab bar specs (§1, §6)
- `.compozy/tasks/bjj-retention-app/_techspec.md` — four screens + 2-tab nav
- `.agents/skills/vercel-react-native-skills/AGENTS.md` — native navigators rule

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_05.md` — theme and components plug into these routes
- `.compozy/tasks/bjj-retention-app/task_06.md` — auth gating replaces layout stub
- `.compozy/tasks/bjj-retention-app/task_11.md` — deep link routes extend this shell

### Related ADRs
- [ADR-003: Cliente mobile — React Native + Expo](../adrs/adr-003.md) — Expo Router client choice

## Deliverables
- Runnable Expo app with Expo Router file structure
- Placeholder screens for Login, Início, Buscar, Player
- Tab bar styled per design tokens (placeholder colors OK until task_05)
- Two-layer test setup: Jest + RNTL (unit) and Jest + local Supabase (integration) with runnable npm scripts (`test:unit`, `test:integration`)
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for route registration **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Root layout exports without error
  - [ ] Tab layout defines exactly two tabs: Início and Buscar
  - [ ] Player route param `id` is declared in file-based route
- Integration tests:
  - [ ] Render root navigator; unauthenticated stub shows login route
  - [ ] Navigate to `(tabs)/index` and `(tabs)/search` without crash
  - [ ] Navigate to `player/[id]` and confirm tab bar hidden (snapshot or option assertion)
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- `npx expo start` runs on Android emulator/device
- All four MVP routes exist and are reachable
- Project structure matches design doc §6 conventions
