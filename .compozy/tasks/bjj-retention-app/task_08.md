---
status: pending
title: Player vertical imersivo com decomposição "De → Para"
type: frontend
complexity: high
dependencies:
  - task_07
---

# Task 08: Player vertical imersivo com decomposição "De → Para"

## Overview

Entrega a experiência imersiva de consumo em vídeo vertical com legenda expansível, decomposição posicional "De → Para", passos numerados e tags clicáveis. É o núcleo do estudo ativo fora do tatame e base para registro de visualizações.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST use `expo-video` for `.mp4`/HLS `urlVideo` (no YouTube embeds)
- MUST render full-bleed vertical player on charcoal background without tab bar
- MUST show title, clickable tag pills, "De → Para" decomposition, numbered steps in expandable caption
- MUST collapse caption to first 2 steps by default with "Ver mais"/"Ver menos" toggle
- MUST render accent `#ff4d8d` ONLY on arrow between De and Para (design constraint)
- MUST support multiple `toPositions` joined with " / " (e.g. "100kg / Montada")
- MUST hide technique block when `fromPosition`/`toPositions`/`steps` are all absent
- MUST implement tap-to-play/pause, centered play button auto-hide ~900ms after play
- MUST implement white progress bar (not pink) with scrub via tap on track
- MUST navigate tag pill tap to search feed for that tag
- MUST NOT implement search in player header or "tirar dúvida" block (removed per design doc §7)
</requirements>

## Subtasks
- [ ] 8.1 Implement ReelsStage layout: video layer, top/bottom scrims, back IconButton
- [ ] 8.2 Wire `expo-video` with loading, error (broken URL), and retry behavior
- [ ] 8.3 Implement ReelsCaption: De→Para, steps list, expand/collapse animation
- [ ] 8.4 Implement ReelsProgress scrubber and play/pause controls
- [ ] 8.5 Load video by route param `id` via repository or passed params
- [ ] 8.6 Add component tests for collapsed steps (max 2) and multi-destination text

## Implementation Details

See PRD **Core Features §3 Player**, `prototipo/design.md` §3 (`ReelsStage` stack), and `prototipo/player.html`. Use `expo-linear-gradient` for scrims, `expo-blur` for back button circle.

Expected paths:
- `src/components/reels/ReelsStage.tsx`, `ReelsCaption.tsx`, `ReelsProgress.tsx`, `ReelsTag.tsx`
- `app/player/[id].tsx` — PlayerScreen

Expose playback progress callback hook for task_09 (50% view) without implementing insert here.

### Relevant Files
- `prototipo/player.html` — tela do Player a reproduzir (fonte de verdade visual: layer stack, steps, anti-patterns)
- `prototipo/design.md` — ReelsStage specs, anti-patterns (§7)
- `.compozy/tasks/bjj-retention-app/_techspec.md` — expo-video decision
- `.agents/skills/vercel-react-native-skills/AGENTS.md` — expo-image/video guidance

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_09.md` — hooks into playback progress from this screen
- `.compozy/tasks/bjj-retention-app/task_10.md` — tag pills navigate to search

### Related ADRs
- [ADR-006: Estrutura de conteúdo da técnica](../adrs/adr-006.md) — De→Para, steps, expandable caption
- [ADR-007: Protótipo high-fidelity como fonte de verdade visual](../adrs/adr-007.md) — PlayerScreen reproduz `prototipo/player.html`

## Deliverables
- Immersive PlayerScreen with working vertical video playback
- Expandable caption with technique metadata and tag navigation
- Broken URL and loading states
- Playback progress events exposed to parent/hook for task_09
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for player UI states **(REQUIRED)**

## Tests
- Unit tests:
  - [ ] Collapsed caption renders exactly 2 step items when 5 steps provided
  - [ ] Expanded caption renders all steps after "Ver mais" toggle
  - [ ] `toPositions=['100kg','Montada']` displays "100kg / Montada"
  - [ ] Missing technique metadata hides ReelsDecomp and ReelsSteps blocks
  - [ ] ReelsArrow style uses accent color token only
  - [ ] Progress bar fill uses white, not accent
- Integration tests:
  - [ ] PlayerScreen loads video v2 from route param and shows title
  - [ ] Tag pill press navigates to search with tag query
  - [ ] Back button returns to previous screen
  - [ ] Broken `urlVideo` shows error StateView with retry action
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Vertical video plays full-bleed without letterboxing on Android pilot device
- Caption expand/collapse matches design doc max-heights and 2-step collapse rule
- Design anti-patterns §7 not present on player screen
