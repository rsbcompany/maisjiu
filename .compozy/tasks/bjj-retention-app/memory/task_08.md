# Task Memory: task_08.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Player imersivo vertical (`app/app/player/[id].tsx`) reproduzindo `prototipo/player.html`: expo-video full-bleed, scrims, back button, título, tag pills, "De → Para" (accent só na seta), passos numerados (colapsado = 2 passos + "Ver mais"), progress bar branca com scrub, tap-to-play/pause com auto-hide 900ms.
- Expor callback de progresso p/ task_09 (50% view) sem inserir aqui.
- Estado inicial: `app/app/player/[id].tsx` é um stub que só mostra "id: {id}".

## Important Decisions

- Instaladas `expo-video@57`, `expo-linear-gradient@57`, `expo-blur@57` (expo-video obrigatório; design.md §6 mapeia gradient→expo-linear-gradient e blur→expo-blur).
- Conflito de design resolvido: `design.md` §3 pede seta "De→Para" com weight 700, mas TechSpec §Design SoT + §7 proíbem 700+ (teto 600). Prevalece a constraint global: seta usa `colors.accent` + weight 600. O teste valida só a cor accent.
- `getVideoById(id)` adicionado ao `ContentRepository` para carregar o vídeo pela rota (subtask 8.5).
- Playback exposto via hook reutilizável `usePlaybackProgress(source)` (retorna player/status/isPlaying/currentTime/duration/progress/retry) — é o seam para task_09 registrar view aos 50% sem reescrever o player.

## Learnings

- Animações `Animated.timing` com `useNativeDriver:false` (maxHeight da legenda) vazavam frames após o teardown do teste (erro "Jest environment torn down" → processo sai 1 mesmo com testes passando). Corrigir retornando cleanup no `useEffect` que chama `animation.stop()`.
- `bun test` roda o runner do Bun (falha); os testes do app rodam via `bun run test` / `bun run test:coverage` (Jest).
- `useEvent(player,'timeUpdate',...)` exige o payload completo (`currentTime`,`currentLiveTimestamp`,`currentOffsetFromLive`,`bufferedPosition`) e o retorno é nullable — usar `?.currentTime ?? player.currentTime`.
- Mocks jest em `jest.setup.js`: `expo` (partial, só `useEvent` → retorna initial), `expo-video` (`useVideoPlayer` retorna player mock com status 'error' quando URL vazia/contém "broken"; chama o setup), `expo-blur`/`expo-linear-gradient` (passthrough View).

## Files / Surfaces

- `app/app/player/[id].tsx` (PlayerScreen + PlayerView), `app/src/hooks/usePlayerData.ts`, `app/src/hooks/usePlaybackProgress.ts`.
- `app/src/components/reels/{ReelsStage,ReelsCaption,ReelsProgress,ReelsTag,index}.tsx`.
- `app/src/data/contentRepository.ts` (+`getVideoById`), `app/jest.setup.js` (mocks), `app/package.json` (+3 deps).
- Testes: `__tests__/unit/components/reels/*`, `__tests__/unit/player.test.tsx`, `__tests__/integration/player.test.tsx`, `__tests__/integration/playerInteractions.test.tsx`; navigation.test atualizado (player agora usa testID `player-screen`).

## Errors / Corrections

## Ready for Next Run

- task_09 deve consumir `usePlaybackProgress` (progress/currentTime/duration/isPlaying) para disparar `recordView` aos 50% e adicionar o Snackbar dev "Visualização registrada (50%)".
- Verificação: `cd app && bun run typecheck && bun run lint && bun run test:coverage` (140 testes, exit 0, cobertura global 97/88/95/98).
