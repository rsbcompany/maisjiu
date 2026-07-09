---
status: completed
title: Biblioteca e busca por tags com chips
type: frontend
complexity: medium
dependencies:
  - task_06
  - task_08
---

# Task 10: Biblioteca e busca por tags com chips

## Overview

Implementa a aba Buscar com filtro por tags normalizadas, chips do vocabulário do acervo e feed vertical de resultados. Permite estudo ativo além da semana atual, conectando tags do player ao acervo completo.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST load tag vocabulary via `ContentRepository.listTags()` for chip row
- MUST filter videos via `searchVideosByTag(tagName)` using case- and accent-insensitive match (Postgres `unaccent` server-side)
- MUST support free-text query matching against existing tag vocabulary (not semantic search)
- MUST highlight active chip when query normalizes equal to tag name
- MUST render SearchHeader with pill-shaped input wrap per design doc
- MUST render FeedItem list (9:16 thumb + title + tags) and navigate to player on tap
- MUST show empty state when no videos match: "Nenhum vídeo encontrado" per design doc
- MUST accept initial `tag` route/search param from home chips or player tag taps
- MUST implement client-side `normalizeTag()` for chip active state consistent with server matching
</requirements>

## Subtasks
- [ ] 10.1 Implement `normalizeTag()` utility (lowercase + strip diacritics)
- [ ] 10.2 Implement SearchHeader and pill SearchInput
- [ ] 10.3 Implement FeedItem row component
- [ ] 10.4 Build SearchScreen: chips, query state, debounced fetch
- [ ] 10.5 Wire `searchVideosByTag` repository query with unaccent filter
- [ ] 10.6 Handle empty results and loading skeleton states

## Implementation Details

See PRD **Core Features §4 Biblioteca**, TechSpec **API Endpoints (Tag search)**, and `prototipo/search.html` + design doc §3 (`SearchHeader`, `FeedItem`).

Expected paths:
- `src/utils/normalizeTag.ts`
- `src/components/SearchHeader.tsx`, `FeedItem.tsx`
- `app/(tabs)/search.tsx` — SearchScreen

Repository query joins `videos` → `video_tags` → `tags` filtering `lower(f_unaccent(nome_tag)) = lower(f_unaccent($1))` — the same expression as the functional index from task_01 (`f_unaccent` is the `IMMUTABLE` wrapper around `unaccent`).

### Relevant Files
- `prototipo/search.html` — tela de Buscar a reproduzir (fonte de verdade visual: layout, chip behavior, empty state)
- `prototipo/design.md` — Search screen state (§5), FeedItem specs
- `src/data/contentRepository.ts` — listTags, searchVideosByTag
- `.compozy/tasks/bjj-retention-app/_techspec.md` — search normalization

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_08.md` — tag pills navigate here
- `.compozy/tasks/bjj-retention-app/task_07.md` — home tag chips navigate here
- `.compozy/tasks/bjj-retention-app/task_11.md` — deep link may include tag param

### Related ADRs
- [ADR-007: Protótipo high-fidelity como fonte de verdade visual](../adrs/adr-007.md) — SearchScreen reproduz `prototipo/search.html`
- PRD **Core Features §4** — normalized tag search, chips from vocabulary

## Deliverables
- SearchScreen with chips, input, and vertical feed
- `normalizeTag` utility with tests
- Repository search query using unaccent
- Empty and loading states
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for search flow **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] `normalizeTag('Passagem')` equals `normalizeTag('passagem')`
  - [ ] `normalizeTag('Estrangulamento')` matches stripped accent variant input
  - [ ] Chip with tag "Meia-guarda" shows active when query normalizes equal
  - [ ] `searchVideosByTag('Passagem')` mock returns videos tagged Passagem only
  - [ ] Empty query shows all acervo videos OR prompts chip selection (match design behavior)
  - [ ] `searchVideosByTag('Inexistente')` returns empty array → empty StateView
- Integration tests:
  - [ ] SearchScreen with tag param `Passagem` pre-fills query and loads filtered feed
  - [ ] Tap FeedItem navigates to `/player/[id]`
  - [ ] All canonical tags from seed appear as chips
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Search for "passagem" finds videos tagged "Passagem"
- Empty search shows design doc empty state copy
- Tag navigation from home and player lands on correct filtered feed
