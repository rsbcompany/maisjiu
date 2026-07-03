-- Consumption distribution: how many students watched 0, 1-2, or 3+ distinct
-- videos in each published week.

WITH distinct_per_user AS (
  SELECT
    w.id AS week_id,
    w.titulo_semana,
    p.id AS user_id,
    COUNT(DISTINCT vv.video_id) AS distinct_videos
  FROM public.weeks w
  CROSS JOIN public.profiles p
  LEFT JOIN public.video_views vv
    ON vv.user_id = p.id
    AND vv.watched_at::date BETWEEN w.data_inicio AND w.data_fim
  GROUP BY w.id, w.titulo_semana, p.id
)
SELECT
  week_id,
  titulo_semana,
  SUM(CASE WHEN distinct_videos = 0 THEN 1 ELSE 0 END) AS watched_0,
  SUM(CASE WHEN distinct_videos BETWEEN 1 AND 2 THEN 1 ELSE 0 END) AS watched_1_to_2,
  SUM(CASE WHEN distinct_videos >= 3 THEN 1 ELSE 0 END) AS watched_3_plus,
  COUNT(*) AS total_students
FROM distinct_per_user
GROUP BY week_id, titulo_semana
ORDER BY week_id;
