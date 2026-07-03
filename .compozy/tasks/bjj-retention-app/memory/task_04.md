# Task Memory: task_04.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

- Scaffold the Expo mobile app in an `app/` package with TypeScript + Expo Router.
- Provide placeholder screens for Login, Início, Buscar and Player.
- Implement the 2-tab bottom navigation shell (Início/Buscar) with 56px tab bar.
- Set up Jest + React Native Testing Library unit tests and route-registration integration tests, both runnable via npm scripts.

## Important Decisions

- Expo project lives in `app/` (monorepo-style) to keep the existing Supabase/test harness at repository root untouched.
- File-based routes follow the requested layout: `app/app/_layout.tsx`, `app/app/login.tsx`, `app/app/(tabs)/_layout.tsx`, `app/app/(tabs)/index.tsx`, `app/app/(tabs)/search.tsx`, `app/app/player/[id].tsx`.
- Auth gating is a stub: `RootLayout` always starts at `login`; task_06 replaces the constant with a real Supabase Auth session check.
- Bottom tabs use Expo Router's `Tabs` (React Navigation bottom-tabs) so the tab bar height can be styled to the design-token 56px.
- Player is a stack screen outside the tab group with `headerShown: false` and `presentation: 'fullScreenModal'`.
- Test harness uses `jest-expo` preset, Jest 29, and `@testing-library/react-native` v13 (v14's async `render` broke `expo-router/testing-library`'s `renderRouter`).

## Learnings

- `expo-router/testing-library`'s `renderRouter` context object expects **bare module keys** (e.g. `_layout`, `login`, `(tabs)/index`, `player/[id]`), not `./_layout.tsx` paths.
- `@testing-library/react-native` v14 returns a Promise from `render`, which is incompatible with the synchronous `renderRouter` in Expo Router v57; pin to v13.
- `jest-expo` depends on Jest 29 packages; installing Jest 30 causes `clearMocksOnScope` runtime errors.

## Files / Surfaces

- `app/package.json` — Expo project manifest with scripts (`test`, `test:unit`, `test:integration`, `test:coverage`, `typecheck`, `lint`).
- `app/app.json` — Android package `ai.rsb.maisjiu`, display name `Mais Jiu`, portrait orientation.
- `app/tsconfig.json` — includes `jest` types and test files.
- `app/jest.config.js`, `app/jest.setup.js` — Jest preset, coverage thresholds and mocks.
- `app/app/_layout.tsx` — root Stack navigator, auth stub.
- `app/app/login.tsx` — placeholder login screen.
- `app/app/(tabs)/_layout.tsx` — tab bar with Início/Buscar, 56px styling.
- `app/app/(tabs)/index.tsx` — placeholder Início screen.
- `app/app/(tabs)/search.tsx` — placeholder Buscar screen.
- `app/app/player/[id].tsx` — placeholder player screen consuming `id` param.
- `app/__tests__/unit/_layout.test.tsx` — root layout smoke test.
- `app/__tests__/unit/tabs.test.tsx` — two-tab assertion.
- `app/__tests__/unit/player.test.tsx` — route param assertion.
- `app/__tests__/integration/navigation.test.tsx` — route registration / navigation smoke.

## Errors / Corrections

- Jest 30 installed initially → downgraded to Jest 29 to match `jest-expo`.
- `@testing-library/react-native` v14 installed initially → downgraded to v13 because its async `render` breaks `renderRouter`.
- `renderRouter` returned `Unmatched Route` when using `./_layout.tsx` keys; switched to bare keys.
- Tab labels clashed with screen titles in assertions; used accessibility labels (`getByLabelText(/, tab/)`) and `getAllByText` for screen titles.
- Coverage branch threshold failed because of `isAuthenticated ? ... : ...` stub; replaced with a single `INITIAL_ROUTE_NAME = 'login'` constant to keep the stub simple and coverage at 100%.

## Ready for Next Run

- task_05 can add `theme/` and shared components, plugging into the existing routes.
- task_06 replaces the auth stub in `app/app/_layout.tsx` with Supabase Auth session gating and SecureStore persistence.
- task_11 adds the `maisjiu` URL scheme and deep-link routing.
