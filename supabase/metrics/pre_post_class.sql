-- Pre-class vs post-class share by weekday heuristic.
-- Views on Monday/Tuesday count as pre-class; all other weekdays count as post-class.

SELECT
  EXTRACT(DOW FROM vv.watched_at) AS day_of_week,
  TO_CHAR(vv.watched_at, 'Day') AS day_name,
  CASE
    WHEN EXTRACT(DOW FROM vv.watched_at) IN (1, 2) THEN 'pre-class'
    ELSE 'post-class'
  END AS bucket,
  COUNT(*) AS views
FROM public.video_views vv
GROUP BY day_of_week, day_name, bucket
ORDER BY day_of_week;
