# Task Memory: task_07.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- HomeScreen (`app/app/(tabs)/index.tsx`) reproduzindo `prototipo/home.html`: AppHeader (saudação+nome+busca), WeekCard, carrossel horizontal de VideoCards 9:16 com edge-fade, chip row de tags, estados loading/empty/error/offline.

## Important Decisions

- Sem `expo-linear-gradient`/`expo-blur` instalados; usar `react-native-svg` (já presente) para edge-fade do carrossel e placeholder de thumb (gradiente 135° via hslToHex).
- `VideoWithTags` não possui `duration` nem `hue`; hue derivado deterministicamente do `id`; badge de duração omitido quando ausente (follow-up: adicionar coluna/thumb real no task_08+).
- Saudação por hora do dia (Bom dia/Boa tarde/Boa noite) — helper puro testável.
- Profile name via `getProfileName` (novo, `profiles.nome` com RLS `maybeSingle`), fora do `ContentRepository` (profile não é conteúdo).
- Fade do carrossel: função pura `getCarouselFadeOpacity({offset,contentWidth,layoutWidth})` (tolerância 6px) → 0/1, testável.
- Offline tratado como estado de erro (sem NetInfo instalado) — mensagem amigável de conexão.

## Learnings

- `SafeAreaProvider` não renderiza filhos em jest sem `initialMetrics`; ao testar telas que usam `SafeAreaView`, envolver com `<SafeAreaProvider initialMetrics={{frame,insets}}>`.
- Peek do carrossel: viewport 412 − pad 16 + 2×(158)+2×(12) → 3º card visível ~56px (~35%), conforme design.
- Cobertura final: 96.62% stmts / 89.1% branches (107 testes). Todos os arquivos novos ≥92%.

## Files / Surfaces

- Novos: `src/components/{AppHeader,WeekCard,VideoCard,Carousel,Skeleton}.tsx`, `src/hooks/useHomeData.ts`, `src/data/getProfileName.ts`, `src/lib/{greeting,color,normalizeText}.ts`.
- Editados: `app/app/(tabs)/index.tsx`, `src/components/index.ts`.

## Errors / Corrections

## Ready for Next Run

- `_tasks.md` (master) está deletado no working tree (staged deletion); não recriado. Status registrado apenas no `task_07.md`.
- Follow-up: `VideoWithTags` sem `duration` real (badge omitido) e sem thumb de CDN — o player/task_08 valida URLs; thumbnails reais ficam para depois.
- Follow-up: sem detecção real de offline (sem NetInfo); estado de erro cobre offline+falha de fetch.
- `AppHeader` só tem a variante home; a variante search (back + título central) fica para task_09.
