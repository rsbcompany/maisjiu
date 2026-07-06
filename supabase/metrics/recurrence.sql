-- Weekly recurrence: students who watched at least one video in more than one
-- published week during the pilot.

WITH active_weeks AS (
  SELECT DISTINCT
    vv.user_id,
    w.id AS week_id
  FROM public.video_views vv
  JOIN public.weeks w
    ON vv.watched_at::date BETWEEN w.data_inicio AND w.data_fim
)
SELECT
  user_id,
  COUNT(*) AS weeks_active,
  ARRAY_AGG(week_id ORDER BY week_id) AS active_week_ids
FROM active_weeks
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY weeks_active DESC, user_id;
