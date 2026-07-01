---
description: Database workflow standards for the Mais Jiu project (Supabase / Postgres)
alwaysApply: true
---

# Database Standards — Mais Jiu

Mandatory workflow for any database work (SQL, migrations, repository queries).
See [`AGENTS.md`](../../AGENTS.md) for project overview; it links here and
requires these rules. Run SQL through the Supabase MCP (`execute_sql`) or the
Supabase CLI — see [`mcp-supabase-setup.md`](../../mcp-supabase-setup.md). Never
run performance experiments against the pilot project `snjaaejvwlkgmyvgrmro`.

## 1. Validate every query you write

Never assume a query works — execute it via the Supabase MCP or CLI and inspect
the real result before moving on.

```sql
-- Run it, don't guess: confirm the current week resolves as expected
SELECT id, titulo_semana FROM weeks
WHERE current_date BETWEEN data_inicio AND data_fim;
```

## 2. Always run EXPLAIN ANALYZE

For any query touching real tables, check the plan and actual timing/rows.

```sql
EXPLAIN ANALYZE
SELECT * FROM weeks
WHERE current_date BETWEEN data_inicio AND data_fim
ORDER BY data_inicio DESC;
```

> On writes, `EXPLAIN ANALYZE` executes the statement — wrap it in a transaction
> and `ROLLBACK` to avoid side effects.

## 3. Index every WHERE clause with the right index type

Every column used in a `WHERE` (or JOIN/ORDER BY) MUST have a supporting index,
and the index type MUST match the access pattern:

| Access pattern | Index type |
|----------------|------------|
| Equality / FK filter | B-tree (default) |
| Range on date/timestamp | B-tree; BRIN for large append-only time series |
| Case/accent-insensitive text | Functional index (wrap `unaccent` as `IMMUTABLE`) |
| Substring / `ILIKE '%x%'` | GIN with `pg_trgm` |

```sql
-- Equality / FK filter
CREATE INDEX idx_videos_week_id ON videos (week_id);

-- Per-user, time-scoped reads (date in WHERE → composite B-tree)
CREATE INDEX idx_video_views_user_watched ON video_views (user_id, watched_at);

-- Normalized tag search: f_unaccent is an IMMUTABLE wrapper around unaccent
-- (see TechSpec Data Models); index and query MUST use the same expression
CREATE INDEX idx_tags_nome_norm ON tags (lower(f_unaccent(nome_tag)));
```

## 4. Use the database as a feedback sensor

After implementing, query back to confirm the expected rows exist, then refine
the implementation based on what the database actually returns.

```sql
-- After recording a view at 50%, verify exactly one row landed for this user
SELECT count(*) FROM video_views
WHERE video_id = $1 AND user_id = auth.uid();
```

If the count, plan, or rows are not what you expected, fix the query/schema and
repeat steps 1–4 until the database confirms the intended behavior.
