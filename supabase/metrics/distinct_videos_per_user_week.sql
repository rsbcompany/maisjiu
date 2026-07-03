-- Primary success metric: average distinct videos watched per student per week.
-- A "view" is recorded once when the playhead reaches 50% of a playback
-- (one row per event in public.video_views).
-- This query deduplicates by (user_id, video_id) inside each published week.

WITH distinct_views AS (
  SELECT
    vv.user_id,
    w.id AS week_id,
    w.titulo_semana,
    COUNT(DISTINCT vv.video_id) AS distinct_videos
  FROM public.video_views vv
  JOIN public.videos v ON v.id = vv.video_id
  JOIN public.weeks w
    ON vv.watched_at::date BETWEEN w.data_inicio AND w.data_fim
  GROUP BY vv.user_id, w.id, w.titulo_semana
)
SELECT
  week_id,
  titulo_semana,
  ROUND(AVG(distinct_videos)::numeric, 2) AS avg_distinct_videos_per_user,
  COUNT(*) AS active_users,
  SUM(distinct_videos) AS total_distinct_views
FROM distinct_views
GROUP BY week_id, titulo_semana
ORDER BY week_id;
