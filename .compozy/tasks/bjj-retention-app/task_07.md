---
status: completed
title: Dashboard "Semana Atual" com carrossel horizontal
type: frontend
complexity: medium
dependencies:
  - task_03
  - task_06
---

# Task 07: Dashboard "Semana Atual" com carrossel horizontal

## Overview

Implementa a tela Início com bloco da semana atual, carrossel horizontal de cards verticais 9:16 e chips exploratórios de tags. É a porta de entrada semanal do aluno, conectando consumo da semana à busca no acervo.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST fetch current week via `ContentRepository.getCurrentWeek(today)` and videos via `getVideosForWeek`
- MUST display personalized greeting from `profiles.nome` in AppHeader
- MUST render WeekCard with caption "SEMANA ATUAL", title, and date range
- MUST implement horizontal carousel with 158px-wide VideoCards, 9:16 aspect, 12px gap, ~33% peek of third card
- MUST implement right-edge fade gradient hiding at scroll end (see design doc Carousel anti false-floor)
- MUST show video count label (e.g. "N vídeos") in section header
- MUST navigate to `player/[id]` on card tap
- MUST render up to 6 exploratory tag chips linking to search with tag param
- MUST handle empty week, loading skeleton, offline, and fetch error states per PRD wireframe notes
- MUST NOT add "Ver mais" button that truncates carousel (design doc §7 anti-pattern)
</requirements>

## Subtasks
- [x] 7.1 Implement AppHeader home variant with greeting and search IconButton
- [x] 7.2 Implement WeekCard and section header with video count
- [x] 7.3 Implement VideoCard and horizontal Carousel with snap and edge fade
- [x] 7.4 Wire HomeScreen data fetching and loading/error/empty states
- [x] 7.5 Add tag chip row navigation to `(tabs)/search?tag=`
- [x] 7.6 Add unit tests for carousel fade logic and empty week rendering

## Implementation Details

See PRD **Core Features §2 Dashboard**, `prototipo/design.md` §3 (`WeekCard`, `Carousel`, `VideoCard`), and `prototipo/home.html`. Use `FlatList` horizontal with `snapToInterval` 170 (158+12).

Expected paths:
- `src/components/AppHeader.tsx`, `WeekCard.tsx`, `VideoCard.tsx`, `Carousel.tsx`
- `app/(tabs)/index.tsx` — HomeScreen

Thumbnail: use gradient placeholder from `hue` or poster frame until real CDN thumbs (task_08 player validates video URLs).

### Relevant Files
- `prototipo/home.html` — tela de Início a reproduzir (fonte de verdade visual)
- `prototipo/design.md` — Carousel dimensions and fade behavior (§3)
- `.compozy/tasks/bjj-retention-app/_prd.md` — dashboard requirements
- `src/data/contentRepository.ts` — data access (task_06)

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_08.md` — player opened from card tap
- `.compozy/tasks/bjj-retention-app/task_11.md` — deep link to semana-atual lands here

### Related ADRs
- [ADR-002: Modelo de estudo ativo](../adrs/adr-002.md) — weekly content at week start
- [ADR-007: Protótipo high-fidelity como fonte de verdade visual](../adrs/adr-007.md) — HomeScreen reproduz `prototipo/home.html`

## Deliverables
- HomeScreen fully wired to Supabase content
- Carousel with edge-fade affordance per design spec
- Empty, skeleton, error, and offline states
- Header search navigates to Buscar tab
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for home data flow **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] When `getCurrentWeek` returns null, StateView empty week message renders
  - [ ] WeekCard displays `tituloSemana` and formatted `dataInicio`–`dataFim`
  - [ ] Carousel fade opacity becomes 0 when scroll offset >= maxScroll - 6
  - [ ] VideoCard `onPress` receives correct video id
  - [ ] Section header shows `${videos.length} vídeos`
- Integration tests:
  - [ ] HomeScreen with mocked repository renders 5 cards from seeded week count
  - [ ] Tap VideoCard navigates to `/player/[id]` route
  - [ ] Tap tag chip navigates to search with normalized tag query param
  - [ ] Loading skeleton visible while fetch pending
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Dashboard shows current seeded week and videos for authenticated user
- Carousel scroll and fade match design doc behavior
- All PRD dashboard empty/error states implemented
