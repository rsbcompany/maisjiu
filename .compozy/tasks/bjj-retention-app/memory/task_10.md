# Task Memory: task_10.md

## Objective Snapshot

Implement the "Buscar" library screen with tag chips, pill search input, debounced
tag search, vertical feed, empty/loading/error states, and navigation to the
player. Wire `ContentRepository.searchVideosByTag` to a Postgres function that
uses the existing `f_unaccent` index for case- and accent-insensitive matching.

## Important Decisions

- Search normalization is shared between client and server:
  - Client: `src/utils/normalizeTag.ts` (lowercase + NFD strip diacritics).
  - Server: `public.search_videos_by_tag(text)` filters with
    `lower(f_unaccent(nome_tag)) = lower(f_unaccent(tag_query))`.
- Empty query returns the full acervo (the function short-circuits on empty
  input), matching the prototype behavior.
- Chip active state is computed with `normalizeTag` so a normalized route param
  (e.g. `passagem`) highlights the canonical chip (`Passagem`).
- Search uses a 300 ms debounce; chip taps apply immediately.
- The `search_videos_by_tag` function was created as a migration and applied to
  the pilot project via Supabase MCP.

## Learnings

- `bun test` runs Bun's native runner and fails on jest-expo/Flow files; the
  project's `bun run test` (jest) is the correct command.
- React Native types now declare a global `const __DEV__`, so tests that tried
  to redeclare it with `declare global { var __DEV__ }` fail typecheck. Use
  `Object.defineProperty(globalThis, '__DEV__', ...)` instead.
- `supabase-js` `.rpc()` is the cleanest way to use the `f_unaccent` functional
  index from the client; ordinary `.from().filter()` cannot express the
  expression.

## Files / Surfaces

- `app/src/utils/normalizeTag.ts`
- `app/src/components/SearchHeader.tsx`
- `app/src/components/FeedItem.tsx`
- `app/src/components/index.ts`
- `app/app/(tabs)/search.tsx`
- `app/src/data/contentRepository.ts`
- `supabase/migrations/20260709120000_search_videos_by_tag.sql`
- Tests:
  - `app/__tests__/unit/utils/normalizeTag.test.ts`
  - `app/__tests__/unit/components/SearchHeader.test.tsx`
  - `app/__tests__/unit/components/FeedItem.test.tsx`
  - `app/__tests__/integration/search.test.tsx`
  - `app/__tests__/unit/data/contentRepository.test.ts` (updated)
- Also fixed an unrelated typecheck failure in
  `app/__tests__/integration/playerViewRecording.test.tsx`.

## Errors / Corrections

- Typecheck initially failed because `useEffect(() => loadTagVocabulary(...))`
  returned a `Promise<void>`. Wrapped the call in a block so the effect returns
  `undefined`.
- Lint warned about unused `error` variables in catch clauses; replaced with
  bare `catch` blocks.
- Lint warned about `Array<T>` in the new `RpcVideo` type; changed to `T[]`.

## Ready for Next Run

- Task implementation and verification are complete.
- Update `_tasks.md` status to `completed` and record any durable cross-task
  context in shared memory.
