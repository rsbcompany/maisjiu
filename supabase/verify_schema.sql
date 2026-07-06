-- Schema verification checklist for Mais Jiu MVP
-- Run this in the Supabase SQL editor (or via MCP execute_sql) after applying
-- supabase/migrations/20250703000000_initial_schema.sql.
-- All queries should return the expected rows/counts.

-- 1. Tables exist
SELECT 'profiles' AS table_name WHERE EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'
)
UNION ALL
SELECT 'weeks' WHERE EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weeks'
)
UNION ALL
SELECT 'videos' WHERE EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'videos'
)
UNION ALL
SELECT 'tags' WHERE EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tags'
)
UNION ALL
SELECT 'video_tags' WHERE EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_tags'
)
UNION ALL
SELECT 'video_views' WHERE EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_views'
);

-- 2. videos technique columns are nullable arrays/text
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'videos'
  AND column_name IN ('from_position', 'to_positions', 'steps')
ORDER BY column_name;

-- 3. Extension and immutable wrapper
SELECT extname FROM pg_extension WHERE extname = 'unaccent';
SELECT proname, provolatile FROM pg_proc WHERE proname = 'f_unaccent';

-- 4. Indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_videos_week_id',
    'idx_video_tags_tag_id',
    'idx_video_views_user_watched',
    'idx_tags_nome_tag',
    'idx_tags_nome_norm'
  )
ORDER BY tablename, indexname;

-- 5. Functional index is used for normalized tag search
EXPLAIN
SELECT * FROM public.tags
WHERE lower(public.f_unaccent(nome_tag)) = lower(public.f_unaccent('acao'));

-- 6. Foreign keys
SELECT
  c.conrelid::regclass::text AS table_name,
  a.attname AS column_name,
  c.confrelid::regclass::text AS foreign_table,
  af.attname AS foreign_column
FROM pg_constraint AS c
JOIN pg_attribute AS a
  ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute AS af
  ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f'
  AND c.conrelid::regclass::text LIKE 'public.%'
ORDER BY c.conrelid::regclass::text, a.attname;
