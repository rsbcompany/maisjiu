---
description: Core coding standards for the Mais Jiu project (TypeScript)
alwaysApply: true
---

# Code Standards — Mais Jiu

Mandatory coding standards for this project. These rules are non-negotiable and
apply to every file. See [`AGENTS.md`](../../AGENTS.md) for project overview and
workflow; that document links here and requires these standards on all code.

Examples use **TypeScript**, the project's implementation language (Expo / React
Native, TypeScript-only stack per ADR-004).

## 1. Write all code in English

Identifiers, comments, and commit-facing code MUST be in English. User-facing
copy (UI strings) stays in Portuguese.

```typescript
// ❌ BAD
const semanaAtual = buscarSemana();

// ✅ GOOD
const currentWeek = getCurrentWeek();
```

## 2. Methods must be at most 3 lines

Keep function bodies to 3 statements or fewer. Extract helpers when longer.

```typescript
// ❌ BAD
function getWeekLabel(week: Week): string {
  const start = formatDate(week.dataInicio);
  const end = formatDate(week.dataFim);
  const range = `${start} – ${end}`;
  return `${week.tituloSemana} (${range})`;
}

// ✅ GOOD
function getWeekLabel(week: Week): string {
  const range = getDateRange(week);
  return `${week.tituloSemana} (${range})`;
}
```

## 3. Avoid more than 3 parameters

If a function needs more than 3 inputs, pass a single typed object.

```typescript
// ❌ BAD
function createView(userId: string, videoId: string, weekId: string, watchedAt: string) {}

// ✅ GOOD
function recordView(event: ViewEvent) {}
```

## 4. Do not nest if/else beyond 2 levels

Use early returns and guard clauses instead of deep nesting.

```typescript
// ❌ BAD
if (session) {
  if (week) {
    if (week.videos.length) {
      render(week);
    }
  }
}

// ✅ GOOD
if (!session) return;
if (!week?.videos.length) return;
render(week);
```

## 5. Avoid switch/case

Prefer lookup maps or polymorphism over `switch`.

```typescript
// ❌ BAD
switch (status) {
  case 'loading': return <Skeleton />;
  case 'empty': return <EmptyState />;
  default: return <Feed />;
}

// ✅ GOOD
const views = { loading: <Skeleton />, empty: <EmptyState /> } as const;
return views[status] ?? <Feed />;
```

## 6. Functions and methods must start with a verb

Name behavior with an action verb (`get`, `render`, `record`, `normalize`).

```typescript
// ❌ BAD
function tagNormalization(tag: string) {}

// ✅ GOOD
function normalizeTag(tag: string) {}
```

## 7. Variables must have clear, objective names

No single letters or vague names. The name states the intent.

```typescript
// ❌ BAD
const d = getVideosForWeek(w);

// ✅ GOOD
const weeklyVideos = getVideosForWeek(weekId);
```

## 8. Each type lives in its own file

One `type`/`interface`/`enum` per file, named after the type it exports.

```typescript
// ❌ BAD — multiple types in src/data/types.ts
export interface Week {}
export interface Video {}

// ✅ GOOD — src/data/Week.ts
export interface Week {}
// ✅ GOOD — src/data/Video.ts
export interface Video {}
```
