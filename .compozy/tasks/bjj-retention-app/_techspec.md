# TechSpec — MVP: App de Retenção e Estudo para Jiu-Jitsu

## Executive Summary

The MVP is delivered as a **React Native + Expo** mobile client (TypeScript) backed entirely by **Supabase** (managed Postgres, Auth, auto REST via PostgREST, and Storage). There is **no custom Go backend**: the client talks to Supabase directly via `supabase-js`, and all read/write authorization is enforced by **Row Level Security (RLS)** policies in Postgres. Concierge content management and success-metric analysis are performed by the admin through the Supabase SQL editor.

The primary technical trade-off: choosing a BaaS (Supabase) over a custom backend maximizes delivery speed and minimizes operational cost for a validation pilot, at the cost of vendor coupling and a deliberate deviation from the project's Go convention (the stack is TypeScript-only). Vertical video uses the native `expo-video` player for an immersive, black-bar-free experience; videos are referenced by external URL (CDN or Supabase Storage), with no in-app upload infrastructure. Each video carries optional structured technique metadata — origin position, one or more destination positions ("De → Para"), and an ordered step list (ADR-006) — rendered in the player's expandable caption.

## System Architecture

### Component Overview

- **Expo Mobile App (client, TypeScript)** — Renders four screens with a 2-tab bottom nav (Início = Dashboard/"Semana Atual", Buscar = Library/Search) plus the immersive Player and the Login entry screen. The Player shows the technique breakdown ("De → Para" + numbered steps) in an expandable caption. Owns navigation (Expo Router), session handling, video playback, and view-event recording. Reads/writes Supabase via `supabase-js`. Android-first for the pilot.
- **Supabase Auth** — Email + password authentication with signup disabled. Issues JWT sessions consumed by the client and by RLS.
- **Supabase Postgres (data + PostgREST API)** — Relational store for content (weeks, videos, tags, junction) and the `video_views` event log. Auto-exposed REST endpoints, gated by RLS.
- **Supabase Storage / External CDN (video hosting)** — Holds vertical `.mp4`/HLS assets; the app only stores/reads the URL.
- **Concierge Admin (out-of-app)** — Admin uses the Supabase SQL editor (service role) to insert weeks/videos/tags, provision accounts, and query metrics.
- **WhatsApp reactivation (out-of-app)** — Professor sends a manual message containing a deep link that opens the current week (or login when unauthenticated).

**Data flow:** App authenticates → fetches current week + its videos (including technique metadata) → user plays a video (native player) and reads the "De → Para" breakdown and numbered steps in the expandable caption → when the playhead reaches 50% of the duration, the app inserts a `video_views` row scoped to the authenticated user (once per playback) → tag taps/search query the junction to return a vertical feed.

## Implementation Design

### Core Interfaces

> Note: per ADR-004 the stack is TypeScript-only (no Go backend), so core interfaces are expressed in TypeScript rather than Go.

Domain types and the data-access contract the screens depend on:

```typescript
export type UUID = string;

export interface Week {
  id: UUID;
  tituloSemana: string;
  dataInicio: string; // ISO date
  dataFim: string;    // ISO date
}

export interface VideoWithTags {
  id: UUID;
  weekId: UUID;
  titulo: string;
  urlVideo: string;
  ordem: number;
  tags: Tag[];
  fromPosition?: string;    // "Meia-guarda"
  toPositions?: string[];   // one or many, e.g. ["100kg", "Montada"]
  steps?: string[];         // ordered technique steps
}

export interface Tag { id: UUID; nomeTag: string; }
```

```typescript
export interface ContentRepository {
  getCurrentWeek(today: string): Promise<Week | null>;
  getVideosForWeek(weekId: UUID): Promise<VideoWithTags[]>;
  listTags(): Promise<Tag[]>; // powers the search chips
  searchVideosByTag(tagName: string): Promise<VideoWithTags[]>; // case/accent-insensitive
  recordView(videoId: UUID): Promise<void>; // fires at 50% playhead; user_id from session
}
```

### Data Models

Relational schema in Postgres. Identity/credentials live in Supabase-managed `auth.users`; a `profiles` row holds the display name.

- **profiles**: `id (uuid, PK, FK → auth.users.id)`, `nome (text)`
- **weeks**: `id (uuid, PK)`, `titulo_semana (text)`, `data_inicio (date)`, `data_fim (date)`, `created_at (timestamptz)`
- **videos**: `id (uuid, PK)`, `week_id (uuid, FK → weeks.id)`, `titulo (text)`, `url_video (text)`, `ordem (int)`, `from_position (text, nullable)`, `to_positions (text[], nullable)`, `steps (text[], nullable)`, `created_at (timestamptz)`
  - `to_positions` and `steps` are stored as ordered text arrays (array order = display order), supporting multiple destination positions and a numbered step list. All three technique-metadata columns are nullable per ADR-006. Positions are **free text** in the MVP (informational only, not navigable), backed by a documented canonical position list in the concierge material to reduce inconsistency. A dedicated `positions` table with controlled vocabulary is deferred to Phase 3, if positions become navigable (position map).
- **tags**: `id (uuid, PK)`, `nome_tag (text, unique)`
- **video_tags** (junction, M:N): `video_id (uuid, FK → videos.id)`, `tag_id (uuid, FK → tags.id)`, PK `(video_id, tag_id)`
- **video_views** (event log — required for the success metric): `id (uuid, PK)`, `user_id (uuid, FK → auth.users.id)`, `video_id (uuid, FK → videos.id)`, `watched_at (timestamptz, default now())`

Indexes: `videos(week_id)`, `video_tags(tag_id)`, `video_views(user_id, watched_at)`, `tags(nome_tag)`.

Search normalization: enable the Postgres `unaccent` extension and, because `unaccent` is not `IMMUTABLE` by default, wrap it in an `IMMUTABLE` SQL function (`f_unaccent(text)`) so the expression can be indexed. Create the functional index `lower(f_unaccent(nome_tag))` and use the same expression in the search query so tag search is case- and accent-insensitive. The deduplicated primary metric counts distinct `(user_id, video_id)` per week from `video_views`; the secondary metric counts all rows (re-watch included).

### API Endpoints

No custom API — operations go through `supabase-js`/PostgREST, gated by RLS (ADR-005):

- **Auth** — `auth.signInWithPassword({ email, password })`; signup/recovery disabled.
- **Current week** — `select` from `weeks` where `current_date between data_inicio and data_fim`, newest first; then `videos` by `week_id` ordered by `ordem`, including `from_position`/`to_positions`/`steps` and nested `tags`.
- **Tag search** — `select` videos joined through `video_tags`/`tags` filtered by `nome_tag` (case- and accent-insensitive via `unaccent`), matched against the existing tag vocabulary surfaced as chips; returns the vertical feed. No semantic search in the MVP.
- **Record view** — when the playhead crosses 50% of the video duration (once per playback; not on card open or manual scrub past the mark), `insert` into `video_views` `{ video_id }`; `user_id` is taken from the JWT via RLS `with check (user_id = auth.uid())`.
- **Admin (service role, out-of-app)** — SQL inserts for content and `select` aggregations for metrics.

## Integration Points

- **Supabase Auth** — JWT-based session persisted ~1 month (refresh token + auto-refresh) in Expo SecureStore, aligned to the monthly content cycle so students do not re-login at each weekly link. RLS consumes `auth.uid()`.
- **Video hosting (Supabase Storage or external CDN)** — Public/signed URLs for `.mp4`/HLS; retried by the native player on transient failures.
- **WhatsApp deep link** — `scheme://semana-atual` or `scheme://video/:id` resolved by Expo Router. When unauthenticated (including cold start with the app closed), the app stores the intended destination, shows login, then resumes to that destination after authenticating. Sending is manual (no API integration).

## Impact Analysis

| Component | Impact Type | Description and Risk | Required Action |
|-----------|-------------|----------------------|-----------------|
| Expo app (client) | new | Entire mobile client (4 screens, 2-tab nav, immersive player), Android-first; greenfield, low regression risk | Scaffold app, screens, navigation, player with technique breakdown |
| Supabase project | exists | Postgres schema, Auth config, Storage bucket | Apply schema + RLS on pilot project (`snjaaejvwlkgmyvgrmro`; see [Supabase Project (piloto)](#supabase-project-piloto)) |
| RLS policies | new | Misconfiguration could leak/block data (medium) | Write and test policies before pilot |
| `video_views` log | new | New table not in `bjj.md`; central to metric | Create table, index, insert at 50% playhead |
| Concierge SQL scripts | new | Manual content/account provisioning | Prepare seed and metric query snippets |

## Testing Approach

### Unit Tests

- Strategy: Jest + React Native Testing Library on critical logic only — `recordView` (fires once when the playhead crosses 50%, not on card open or scrub; correct payload), `searchVideosByTag` (case- and accent-insensitive, empty results), `listTags` (powers chips), current-week selection by date, and tag-pill navigation.
- Mocks: mock the `supabase-js` client at the `ContentRepository` boundary; no network in unit tests.
- Edge cases: no current week published, week with zero videos, video with no tags, video with no technique metadata (no `from`/`to`/`steps`), video with multiple destination positions, search with no matches, expired session, invalid login credentials, unavailable/broken video URL, and offline (no connection).

### Integration Tests

Integration tests are **in scope** for the MVP (data / RLS layer):

- **Data / RLS layer — Jest + local Supabase (CLI + Docker).** Run the real `ContentRepository` against a local Supabase stack started with `supabase start` (Postgres, Auth, PostgREST in Docker), seeded from `supabase/seed.sql`. Validates schema, RLS policies (authenticated read, per-user `video_views` insert/read isolation, anon blocked), and repository queries end-to-end. Fallback when Docker is unavailable (e.g. constrained CI): a dedicated Supabase cloud test project (separate `project_ref`, never the pilot).

Framework summary:

| Layer | Framework | Target |
|-------|-----------|--------|
| Unit | Jest + React Native Testing Library | Critical logic, mocked `supabase-js` |
| Integration (data/RLS) | Jest + local Supabase (CLI/Docker) | Repository + RLS against real Postgres |

Test data isolation: integration runs use a disposable local database (reset per run via `supabase db reset`) or the dedicated cloud test project — never the pilot project `snjaaejvwlkgmyvgrmro`.

**End-to-end (UI) — deferred to Phase 2.** Automated E2E flows (e.g. Maestro on an Android emulator) are out of scope for now; the full flow (login → dashboard → player → view → search) is covered by manual smoke during the pilot. Revisit E2E automation in Phase 2.

## Development Sequencing

### Build Order

1. **Provision Supabase**: apply relational schema (`profiles`, `weeks`, `videos`, `tags`, `video_tags`, `video_views`), indexes, and RLS policies on the existing pilot project (see [Supabase Project (piloto)](#supabase-project-piloto)) — no dependencies.
2. **Seed concierge data + accounts**: insert one week with videos/tags plus technique metadata (`from_position`, `to_positions`, `steps`) and create pilot accounts; seed content available in `prototipo/player.html` — depends on step 1.
3. **Expo scaffold + auth**: app skeleton, Expo Router, `supabase-js`, 1-month persistent session (refresh token + auto-refresh in SecureStore), login screen — depends on step 1.
4. **Dashboard "Semana Atual"**: header/greeting from `profiles`, current-week block, horizontal vertical-card carousel — depends on steps 2 and 3.
5. **Vertical player + technique breakdown**: `expo-video` immersive player, title, clickable tag pills, "De → Para" decomposition (multiple destinations), numbered steps in an expandable caption (collapsed shows the first 2 steps + "Ver mais") — depends on step 4.
6. **View-event recording**: insert into `video_views` when the playhead reaches 50% of the duration (once per playback; not on card open or manual scrub past the mark) — depends on steps 1 and 5.
7. **Tag search feed**: tag chips (from `listTags`) + free text, case- and accent-insensitive (`unaccent`) → vertical feed via junction query; no semantic search — depends on step 5.
8. **WhatsApp deep link**: route to current week or specific video; preserve the destination through login when unauthenticated (incl. cold start) — depends on step 4.
9. **Unit tests**: critical-logic suite + mocks (Jest + RNTL) — depends on steps 3–7.
10. **Metric SQL snippets**: admin queries for distinct videos/user/week (primary), total views/user/week (secondary), distribution, recurrence, and pre/post-class split by weekday — depends on step 6.
11. **Integration tests**: repository/RLS suite against local Supabase (Jest) covering authenticated read, per-user `video_views` isolation, and tag search — depends on steps 6–8. (E2E automation deferred to Phase 2; manual smoke covers the full flow.)

### Technical Dependencies

- Supabase pilot project provisioned and reachable (see below).
- At least one published week with vertical video URLs available.
- Pilot accounts created (signup disabled).
- Supabase CLI + Docker for the local integration stack (`supabase start`), or a dedicated cloud test project as fallback.

### Supabase Project (piloto)

The Supabase project for this MVP **already exists**. Schema, RLS, seed, and metric SQL are applied to this instance — not a greenfield project creation step.

| Item | Value |
|------|-------|
| `project_ref` | `snjaaejvwlkgmyvgrmro` |
| MCP URL | `https://mcp.supabase.com/mcp?project_ref=snjaaejvwlkgmyvgrmro` |

**Agent / dev tooling:** MCP setup and OAuth instructions live in [`mcp-supabase-setup.md`](../../../mcp-supabase-setup.md) at the repository root. Prefer Supabase MCP (`execute_sql`, advisors) when available; do not duplicate MCP client config in this document.

**App client:** the Expo app uses the public Supabase URL and anon key via environment variables (e.g. `.env` / EAS secrets) — never commit service-role keys.

## Monitoring and Observability

- **Primary metric (SQL):** average **distinct** videos watched per student per week (deduplicated by student/video/week), derived from `video_views` joined to `weeks` via `watched_at`.
- **Secondary (SQL):** total views per student per week (all 50% events, re-watch included), consumption distribution (0 / 1–2 / 3+ distinct per week), weekly recurrence, tag-search usage, and pre- vs post-class share via weekday heuristic (Mon/Tue = pre-class; other days = post-class; no class schedule needed).
- **Logs:** Supabase Auth and PostgREST logs for failed logins and rejected RLS operations.
- **Alerting:** none automated in the MVP; admin reviews metric queries weekly during the ~4-week pilot.

## Technical Considerations

### Key Decisions

- **Decision:** BaaS (Supabase) instead of a custom backend. **Rationale:** speed, native SQL admin, built-in auth/RLS. **Trade-offs:** vendor coupling, no Go layer. **Rejected:** Go API + Postgres, Firebase. (ADR-004)
- **Decision:** React Native + Expo client. **Rationale:** single codebase, native vertical-video UX. **Trade-offs:** store/test-build distribution friction. **Rejected:** PWA, Flutter, native split. (ADR-003)
- **Decision:** Supabase Auth (email+password) + RLS, signup disabled. **Rationale:** secure, pre-created accounts, per-student data isolation. **Trade-offs:** requires an email per student. **Rejected:** custom auth table, username login. (ADR-005)
- **Decision:** native `expo-video` for `.mp4`/HLS; generic `url_video`. **Rationale:** immersive fullscreen without black bars. **Trade-offs:** YouTube embeds dropped — `expo-video` cannot play YouTube URLs and embeds break the single 50% definition. (PRD §Constraints)
- **Decision:** a "view" is recorded at 50% of the playhead (once per playback), and metrics separate distinct videos (primary) from total views (secondary). **Rationale:** reflects genuine consumption, not card opens or scrubs. **Trade-offs:** requires playback-progress tracking in the player. (PRD §Core Features 5, §Success Metrics)
- **Decision:** store technique metadata as nullable columns on `videos` — `from_position (text)`, `to_positions (text[])`, `steps (text[])` — instead of separate tables; positions are free text (informational only) with a documented canonical list to reduce inconsistency. **Rationale:** minimal schema supporting multiple destinations and step ordering via array order (YAGNI); positions are not navigable in the MVP. **Trade-offs:** consistency relies on admin discipline, not a DB constraint. **Rejected:** dedicated `positions` table (deferred to Phase 3 if positions become navigable); reusing tags as positions (tags are broad themes, positions are specific states — the data diverges). (ADR-006)
- **Decision:** automated integration testing via Jest + local Supabase (CLI/Docker) for the repository/RLS data layer; end-to-end UI automation is deferred to Phase 2. **Rationale:** RLS is the medium-risk area and must be validated against real Postgres, not mocks; E2E automation adds Docker/emulator CI cost that is not justified for the pilot, where manual smoke suffices. **Trade-offs:** requires Docker for the local integration stack; no automated UI regression coverage until Phase 2. **Rejected (for now):** mock-only integration (would not exercise real RLS); Maestro/Detox E2E (deferred to Phase 2); testing against the pilot project (risks polluting metrics).

### Known Risks

- **RLS misconfiguration** (medium likelihood): could expose or block data — mitigation: explicit policy tests and review before the pilot.
- **Install/distribution friction** (Expo test builds): may reduce adoption — mitigation: clear WhatsApp instructions, pre-created accounts.
- **Vendor coupling to Supabase**: Phase 3 (admin panel, multi-academy, billing) may require a real backend — accepted as controlled MVP debt.
- **Video hosting/availability**: broken external URLs degrade UX — mitigation: validate URLs at seed time; player retry.

## Architecture Decision Records

- [ADR-001: Estratégia de MVP — Concierge Enxuto](adrs/adr-001.md) — Build exactly the 3 screens with invisible view tracking and manual WhatsApp reactivation.
- [ADR-002: Modelo de estudo ativo — conteúdo publicado no início da semana](adrs/adr-002.md) — Reposition to active study (preview before class + review after).
- [ADR-003: Cliente mobile — React Native + Expo](adrs/adr-003.md) — Single-codebase native client over PWA/Flutter/native-split.
- [ADR-004: Backend e dados — Supabase (BaaS), sem backend Go](adrs/adr-004.md) — Managed Postgres/Auth/REST; TypeScript-only, deviating from the Go convention.
- [ADR-005: Autenticação e segurança — Supabase Auth + RLS](adrs/adr-005.md) — Email+password with signup disabled and per-student RLS isolation.
- [ADR-006: Estrutura de conteúdo da técnica — "De → Para" e passo a passo](adrs/adr-006.md) — Per-video origin/destination(s) and ordered steps, shown in the player's expandable caption; stored as nullable array columns.
