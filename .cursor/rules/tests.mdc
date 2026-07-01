---
description: Automated testing standards for the Mais Jiu project (Jest)
alwaysApply: true
---

# Testing Standards — Mais Jiu

Everything implemented MUST ship with automated tests written in **Jest**. See
[`AGENTS.md`](../../AGENTS.md) and the TechSpec "Testing Approach" for the layer
frameworks; this rule defines how tests are written.

## 1. Test everything you implement

No feature, fix, or refactor is done without Jest tests covering its behavior and
edge cases. If it is not tested, it is not complete.

## 2. Structure each test with AAA or GWT

Use **Arrange · Act · Assert** or **Given · When · Then**. One clear behavior per
test.

```typescript
it('records a view once when the playhead crosses 50%', () => {
  // Arrange
  const repository = createRepositoryMock();
  const player = createPlayer({ durationSeconds: 60, repository });
  // Act
  player.advanceTo(30);
  // Assert
  expect(repository.recordView).toHaveBeenCalledTimes(1);
});
```

## 3. Tests must be independent

No test may depend on another's state or execution order. Reset shared state and
mocks between tests; each test sets up its own data.

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## 4. Mock external dependencies for repeatability

Any external dependency (Supabase, network, device APIs) MUST be mocked or
stubbed so tests are deterministic and offline.

```typescript
// Mock supabase-js at the ContentRepository boundary — no real network
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(() => queryBuilderStub) },
}));
```

## 5. Write unit and integration tests — no end-to-end for now

- **Unit** — Jest + React Native Testing Library; dependencies mocked.
- **Integration** — Jest against a local Supabase stack (real Postgres + RLS),
  per TechSpec "Testing Approach".
- **End-to-end** — out of scope for now. Do NOT add Maestro/Detox UI flows yet.
