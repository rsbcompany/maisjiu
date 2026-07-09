-- Migration: server-side case- and accent-insensitive tag search
--
-- Adds a helper function used by the Expo app via `supabase-js` `.rpc()`.
-- The filter uses the same `lower(f_unaccent(nome_tag))` expression as the
-- functional index `idx_tags_nome_norm` created in the initial schema migration.
-- An empty or null query returns the full video library so the search screen
-- can show the acervo before the student types or selects a chip.

CREATE OR REPLACE FUNCTION public.search_videos_by_tag(tag_query text)
RETURNS TABLE (
  id uuid,
  week_id uuid,
  titulo text,
  url_video text,
  ordem integer,
  from_position text,
  to_positions text[],
  steps text[],
  tags jsonb
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT
    v.id,
    v.week_id,
    v.titulo,
    v.url_video,
    v.ordem,
    v.from_position,
    v.to_positions,
    v.steps,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('id', t.id, 'nome_tag', t.nome_tag)
          ORDER BY t.nome_tag
        )
        FROM public.video_tags vt
        JOIN public.tags t ON t.id = vt.tag_id
        WHERE vt.video_id = v.id
      ),
      '[]'::jsonb
    ) AS tags
  FROM public.videos v
  WHERE tag_query IS NULL
     OR tag_query = ''
     OR EXISTS (
       SELECT 1
       FROM public.video_tags vt
       JOIN public.tags t ON t.id = vt.tag_id
       WHERE vt.video_id = v.id
         AND lower(public.f_unaccent(t.nome_tag)) = lower(public.f_unaccent(tag_query))
     )
  ORDER BY v.ordem;
$$;

COMMENT ON FUNCTION public.search_videos_by_tag(text) IS
  'Returns videos whose tags match the query case- and accent-insensitively via f_unaccent. Empty query returns the full library.';

-- Only authenticated students may execute the function. RLS policies inside
-- the function still apply because it runs with SECURITY INVOKER.
REVOKE EXECUTE ON FUNCTION public.search_videos_by_tag(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_videos_by_tag(text) TO authenticated;
