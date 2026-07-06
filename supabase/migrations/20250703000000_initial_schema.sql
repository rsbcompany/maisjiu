-- Migration: initial MVP schema for Mais Jiu
-- Pilot project_ref: snjaaejvwlkgmyvgrmro
--
-- Tables:
--   profiles     (display name, FK to auth.users)
--   weeks        (published study week)
--   videos       (vertical video + nullable technique metadata)
--   tags         (searchable tag vocabulary)
--   video_tags   (M:N junction)
--   video_views  (50% playhead view events)

-- 1. Extensions
--------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;

-- IMMUTABLE wrapper so unaccent can be used in functional indexes.
-- Supabase/Postgres marks unaccent as STABLE by default.
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public, pg_temp
AS $$
  SELECT public.unaccent($1);
$$;

COMMENT ON FUNCTION public.f_unaccent(text) IS
  'IMMUTABLE wrapper around unaccent for indexable case/accent-insensitive search.';

-- 2. Tables
--------------------------------------------------------------------------------

-- Display name for each Supabase Auth user.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Per-student display name; one row per auth.users account.';

-- A published study week (preview before class + review after).
CREATE TABLE IF NOT EXISTS public.weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo_semana text NOT NULL,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.weeks IS 'Study week published at the beginning of the week.';

-- Vertical video with optional structured technique metadata.
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  url_video text NOT NULL,
  ordem integer NOT NULL,
  from_position text,
  to_positions text[],
  steps text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.videos IS 'Vertical video inside a week; technique metadata is optional (ADR-006).';
COMMENT ON COLUMN public.videos.from_position IS 'Origin position of the technique (e.g. "Meia-guarda").';
COMMENT ON COLUMN public.videos.to_positions IS 'One or many destination positions; array order = display order.';
COMMENT ON COLUMN public.videos.steps IS 'Ordered step-by-step technique instructions.';

-- Searchable tag vocabulary.
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_tag text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tags IS 'Case/accent-insensitive search vocabulary surfaced as chips.';

-- M:N junction between videos and tags.
CREATE TABLE IF NOT EXISTS public.video_tags (
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, tag_id)
);

COMMENT ON TABLE public.video_tags IS 'M:N relationship between videos and tags.';

-- View event log: one row when the playhead reaches 50% of a playback.
CREATE TABLE IF NOT EXISTS public.video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  watched_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.video_views IS '50% playhead view events; basis for success metrics.';

-- 3. Indexes
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_videos_week_id ON public.videos (week_id);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag_id ON public.video_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user_watched ON public.video_views (user_id, watched_at);
CREATE INDEX IF NOT EXISTS idx_tags_nome_tag ON public.tags (nome_tag);

-- Functional index for case- and accent-insensitive tag search.
CREATE INDEX IF NOT EXISTS idx_tags_nome_norm ON public.tags (lower(public.f_unaccent(nome_tag)));
