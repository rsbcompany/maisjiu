---
status: pending
title: Deep linking WhatsApp com destino preservado no login
type: frontend
complexity: medium
dependencies:
  - task_06
  - task_07
---

# Task 11: Deep linking WhatsApp com destino preservado no login

## Overview

Configura deep links nativos para reativação via WhatsApp, abrindo a semana atual ou um vídeo específico. Preserva o destino quando o aluno precisa fazer login (incluindo cold start), completando o fluxo principal do PRD.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST configure custom URL scheme in `app.json` (e.g. `maisjiu://`) for Expo Router linking
- MUST support paths: `maisjiu://semana-atual` → `(tabs)/index` (current week dashboard)
- MUST support paths: `maisjiu://video/:id` → `player/[id]`
- MUST support optional tag path or query: navigate to search with tag (align with `maisjiu://buscar?tag=` or equivalent)
- MUST persist intended destination in memory/SecureStore when user is unauthenticated on link open (cold start included)
- MUST after successful login navigate to preserved destination, not default home
- MUST clear preserved destination after successful navigation to avoid loops
- MUST document example WhatsApp message links for concierge in repo docs
</requirements>

## Subtasks
- [ ] 11.1 Configure Expo linking scheme and `app.json` intent filters (Android)
- [ ] 11.2 Map URL paths to Expo Router routes in linking config
- [ ] 11.3 Implement pending deep link store (SecureStore or async module)
- [ ] 11.4 Integrate with auth layout: save link on unauthenticated open, resume post-login
- [ ] 11.5 Document concierge WhatsApp link templates for professor
- [ ] 11.6 Add unit tests for URL parsing and pending destination lifecycle

## Implementation Details

See TechSpec **Integration Points (WhatsApp deep link)**, PRD **User Experience (Deep link pós-login)**. Use Expo Router `Linking` API and `expo-linking` for incoming URLs.

Expected paths:
- `app.json` — `scheme`, Android intent filters
- `src/navigation/deepLink.ts` — parse URL, pending destination read/write
- `app/_layout.tsx` — consume pending link after auth

Example concierge links (document only):
- `maisjiu://semana-atual`
- `maisjiu://video/<uuid>`

### Relevant Files
- `app/_layout.tsx` — auth gate from task_06
- `.compozy/tasks/bjj-retention-app/_techspec.md` — deep link behavior
- `.compozy/tasks/bjj-retention-app/_prd.md` — WhatsApp reactivation flow
- `prototipo/design.md` — search tag param behavior (§5 Search)

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_07.md` — semana-atual destination
- `app/player/[id].tsx` — video destination

### Related ADRs
- [ADR-001: Estratégia de MVP — Concierge Enxuto](../adrs/adr-001.md) — manual WhatsApp reactivation

## Deliverables
- Working custom scheme deep links on Android
- Pending destination preserved through login flow
- Concierge doc snippet with example links for professor
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for cold-start link + login resume **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Parse `maisjiu://semana-atual` returns route `(tabs)/index`
  - [ ] Parse `maisjiu://video/abc-123` returns route `player/abc-123`
  - [ ] Pending destination saved when session null
  - [ ] Pending destination cleared after successful navigation
  - [ ] Malformed URL returns safe fallback to home without crash
- Integration tests:
  - [ ] Unauthenticated open of video deep link → login screen → post-login lands on `player/[id]`
  - [ ] Authenticated open of semana-atual link lands on dashboard without login
  - [ ] Cold start simulation: pending link survives until login completes
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Android device opens app to correct screen from WhatsApp-style link
- Login intermediate step preserves and restores destination
- Concierge documentation includes copy-paste link examples
