-- Secondary metric: total view events per student per week.
-- Unlike the primary metric, re-watches of the same video are counted here.

SELECT
  vv.user_id,
  w.id AS week_id,
  w.titulo_semana,
  COUNT(*) AS total_views,
  COUNT(DISTINCT vv.video_id) AS distinct_videos
FROM public.video_views vv
JOIN public.videos v ON v.id = vv.video_id
JOIN public.weeks w
  ON vv.watched_at::date BETWEEN w.data_inicio AND w.data_fim
GROUP BY vv.user_id, w.id, w.titulo_semana
ORDER BY total_views DESC;
