---
status: pending
title: Registro de visualizações aos 50% do playhead
type: frontend
complexity: medium
dependencies:
  - task_02
  - task_08
---

# Task 09: Registro de visualizações aos 50% do playhead

## Overview

Implementa a regra de negócio central do piloto: registrar um evento de visualização quando o playhead atinge 50% da duração, uma vez por sessão de reprodução. Alimenta as métricas de retenção consultáveis via SQL pelo concierge.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST fire `ContentRepository.recordView(videoId)` when playhead crosses 50% of duration during active playback
- MUST fire at most once per playback session per video (re-watch in new session may fire again)
- MUST NOT fire on card open, pause before 50%, or manual scrub jumping past 50% without continuous playback through threshold (per PRD Feature 5)
- MUST reset "viewed this session" flag when user scrubs backward below 50% or restarts playback from beginning
- MUST insert `{ video_id }` only; `user_id` enforced by RLS from JWT
- MUST complete `recordView` implementation in repository (stub from task_06 replaced)
- SHOULD show optional dev-only Snackbar "Visualização registrada (50%)" matching prototipo (hide in production or behind `__DEV__`)
</requirements>

## Subtasks
- [ ] 9.1 Implement pure `shouldRecordView(progress, duration, sessionState)` helper
- [ ] 9.2 Wire expo-video progress events in PlayerScreen to helper
- [ ] 9.3 Implement `recordView` Supabase insert in ContentRepository
- [ ] 9.4 Handle insert failure gracefully (log, no user-blocking crash)
- [ ] 9.5 Add comprehensive unit tests for edge cases from TechSpec Testing Approach

## Implementation Details

See TechSpec **API Endpoints (Record view)**, PRD **Core Features §5**, and **Success Metrics**. Logic belongs in testable pure functions under `src/data/viewRecording.ts` or similar, consumed by PlayerScreen.

Progress source: `expo-video` timeUpdate / status callbacks providing currentTime and duration.

### Relevant Files
- `src/data/contentRepository.ts` — `recordView` insert
- `app/player/[id].tsx` — wires progress to recording
- `.compozy/tasks/bjj-retention-app/_techspec.md` — 50% definition and edge cases
- `.compozy/tasks/bjj-retention-app/_prd.md` — view event definition

### Dependent Files
- `supabase/metrics/*.sql` — task_03 queries consume `video_views` rows
- `.compozy/tasks/bjj-retention-app/task_03.md` — metric SQL validates events

### Related ADRs
- [ADR-001: Estratégia de MVP — Concierge Enxuto](../adrs/adr-001.md) — invisible view tracking

## Deliverables
- `recordView` repository method inserting into `video_views`
- Pure progress/threshold helper with full edge-case coverage
- Player integration firing record at 50% once per session
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests with mocked Supabase insert **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Progress 0.49 with continuous playback does NOT trigger record
  - [ ] Progress 0.50 triggers exactly one record call
  - [ ] Second progress update at 0.80 does NOT trigger second record same session
  - [ ] Scrub from 0.60 back to 0.30 resets session flag; crossing 0.50 again triggers new record
  - [ ] Opening player without playing (progress 0) does NOT trigger record
  - [ ] Scrub jump from 0.10 to 0.90 without crossing continuously: behavior matches PRD (no record unless playback crosses 50%)
  - [ ] `recordView` sends only `{ video_id }` payload to Supabase mock
- Integration tests:
  - [ ] Mock authenticated session + 50% progress inserts one row via repository
  - [ ] RLS rejection (mock 403) surfaces logged error without crashing player
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Single `video_views` row inserted per student/video per playback session at 50%
- Manual smoke: play seeded video past halfway → row visible in Supabase SQL editor
- PRD edge cases covered by unit tests
