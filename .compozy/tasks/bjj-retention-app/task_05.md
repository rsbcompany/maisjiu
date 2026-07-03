---
status: completed
title: Design system e componentes base de UI
type: frontend
complexity: medium
dependencies:
  - task_04
---

# Task 05: Design system e componentes base de UI

## Overview

Implementa tokens de design e componentes reutilizáveis fielmente ao protótipo high-fidelity, garantindo consistência visual nas quatro telas do MVP. Centraliza cores, tipografia e espaçamento para que telas subsequentes não dupliquem estilos ad hoc.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement theme tokens from `prototipo/design.md` §2: colors, spacing, radius, typography, motion
- MUST enforce hard constraints: bg `#f7f4ed` (no pure white canvas), max font weight 600, accent `#ff4d8d` reserved (not on primary CTAs)
- MUST implement components: `Button`, `Input`, `Field`, `Tag`, `Snackbar`, `IconButton`, `StateView`, `Caption`
- MUST use `Pressable` (not TouchableOpacity) for interactive components
- MUST meet 44×44 minimum touch targets on `IconButton`
- MUST export theme from `src/theme/index.ts` (or equivalent) for screen consumption
- SHOULD map icons from prototipo HTML SVGs to `react-native-svg` components under `src/components/icons/`
</requirements>

## Subtasks
- [x] 5.1 Create `src/theme/` modules: colors, spacing, typography, motion
- [x] 5.2 Implement base form components: Field, Input, Button, Helper error text
- [x] 5.3 Implement Tag chip with default and active (filled) states
- [x] 5.4 Implement Snackbar with slide-up animation (~2200ms auto-hide)
- [x] 5.5 Implement StateView (empty/loading/error) and Caption typography helper
- [x] 5.6 Add component snapshot/unit tests for variant rendering

## Implementation Details

See `prototipo/design.md` §2 (tokens) and §3 (component inventory). Reference `prototipo/css/app.css` for CSS-to-RN mapping in design doc §6.

Expected paths:
- `src/theme/colors.ts`, `spacing.ts`, `typography.ts`, `index.ts`
- `src/components/Button.tsx`, `Input.tsx`, `Field.tsx`, `Tag.tsx`, `Snackbar.tsx`, `IconButton.tsx`, `StateView.tsx`, `Caption.tsx`

Primary CTA: charcoal (`fg`) background, not pink. Borders `#eceae4` instead of shadows except snackbar elevation.

### Relevant Files
- `prototipo/design.md` — authoritative design system
- `prototipo/css/app.css` — token source (`:root` variables)
- `prototipo/login.html` — Button, Input, Field, Helper reference
- `prototipo/home.html` — Tag chip, Caption, IconButton reference
- `prototipo/player.html` — Snackbar, ReelsTag patterns reference
- `prototipo/search.html` — SearchInput, FeedItem caption reference
- `.agents/skills/vercel-react-native-skills/AGENTS.md` — Pressable, styling patterns

### Dependent Files
- `.compozy/tasks/bjj-retention-app/task_06.md` — LoginScreen uses form components
- `.compozy/tasks/bjj-retention-app/task_07.md` — WeekCard, VideoCard build on Tag/Caption
- `.compozy/tasks/bjj-retention-app/task_08.md` — Reels components extend Tag patterns

### Related ADRs
- [ADR-007: Protótipo high-fidelity como fonte de verdade visual](../adrs/adr-007.md) — `prototipo/` + `design.md` are the visual source of truth; tokens, components and anti-patterns must be reproduced
- PRD **High-Level Technical Constraints** — design system reference to `prototipo/design.md`

## Deliverables
- Complete `src/theme/` token modules
- Eight base components with documented props matching design doc §3
- Icon components stub or extracted from prototipo SVGs
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for composed form **(REQUIRED)**

## Tests
- Unit tests:
  - [x] `colors.accent` equals `#ff4d8d` and `colors.bg` equals `#f7f4ed`
  - [x] Button primary variant uses `fg` background, not accent
  - [x] Tag `active` state renders filled fg background
  - [x] Input with `error` prop applies danger border color
  - [x] IconButton enforces minimum 44×44 hit area
  - [x] Snackbar calls `onDismiss` after configured duration (fake timers)
- Integration tests:
  - [x] Field + Input + Button compose login form without layout overflow
  - [x] StateView renders empty state title and description from props
- Test coverage target: >=80%
- All tests must pass

## Success Criteria
- All tests passing
- Test coverage >=80%
- Theme tokens match design doc §2 values
- All eight base components exported and usable from screens
- Design anti-patterns from design doc §7 not violated in components
