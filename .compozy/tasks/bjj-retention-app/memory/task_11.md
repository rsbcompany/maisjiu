# Task Memory: task_11.md

Keep only task-local execution context here. Do not duplicate facts that are obvious from the repository, task file, PRD documents, or git history.

## Objective Snapshot

Implement WhatsApp deep links (`maisjiu://semana-atual`, `maisjiu://video/<id>`, `maisjiu://buscar?tag=`) with destination preservation through the login flow, including cold start. Deliver unit + integration tests, concierge docs, and update app linking configuration.

## Important Decisions

- Centralized deep-link handling in `app/app/_layout.tsx` via `useDeepLink(session)`:
  - Authenticated incoming URLs navigate immediately.
  - Unauthenticated incoming URLs (including cold start) are saved to SecureStore.
  - After login, the pending destination is resumed with `router.replace` and then cleared.
- `app/app/login.tsx` no longer navigates after sign-in; the auth-state change in `_layout.tsx` drives post-login routing.
- Used `Href` type assertion for dynamic `pathname` values to satisfy Expo Router typed routes.
- Used an in-memory `Map` backed mock for `expo-secure-store` in integration tests so `setItemAsync`/`getItemAsync` round-trips work across the cold-start → login resume flow.

## Learnings

- `renderRouter(..., { initialUrl: '/(tabs)' }).getPathname()` returns `/` for the tabs index, not `/(tabs)`.
- `Linking.parse('maisjiu://video/abc')` yields `hostname: 'video'`, `path: 'abc'` in the current mock.
- `Stack.Protected` handles the unauthenticated → authenticated screen swap; explicit `router.replace('/(tabs)')` from `login.tsx` is unnecessary and would race with pending-destination resume.

## Files / Surfaces

- `app/app.json` — changed `scheme` from `app` to `maisjiu`; added Android `intentFilters`.
- `app/app/_layout.tsx` — added `useDeepLink(session)` hook and navigation helpers.
- `app/app/login.tsx` — removed `useRouter` and post-sign-in navigation.
- `app/src/navigation/DeepLinkRoute.ts` — new type for parsed deep-link destinations.
- `app/src/navigation/deepLink.ts` — new parser + SecureStore pending-destination store.
- `app/jest.setup.js` — added `expo-linking` mock (`parse`, `getInitialURL`, `addEventListener`).
- `app/__tests__/unit/navigation/deepLink.test.ts` — new unit tests for parser and store.
- `app/__tests__/integration/deepLink.test.tsx` — new integration tests for authenticated/unauthenticated flows and cold start.
- `app/__tests__/unit/login.test.tsx` — updated to reflect login no longer navigates.
- `docs/concierge-deep-links.md` — new concierge copy-paste link templates.

## Errors / Corrections

- TypeScript rejected dynamic `{ pathname: string }` for `router.replace`/`router.navigate` because `typedRoutes` is enabled. Fixed by casting the target to `Href`.
- First integration test asserted `getPathname()` was `/(tabs)` after deep link to dashboard, but Expo Router reports it as `/`. Updated assertion to verify dashboard content and pathname `/`.

## Ready for Next Run

Task complete. No further work required unless the user asks for a commit or follow-up adjustments.
