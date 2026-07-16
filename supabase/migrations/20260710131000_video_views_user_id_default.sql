-- Migration: default video_views.user_id to the authenticated JWT user.
-- The mobile app inserts view events with only video_id; the database
-- fills user_id from auth.uid() and RLS enforces the row belongs to the caller.
ALTER TABLE public.video_views
ALTER COLUMN user_id SET DEFAULT auth.uid();
