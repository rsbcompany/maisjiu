-- Migration: Row Level Security policies for Mais Jiu MVP
-- Pilot project_ref: snjaaejvwlkgmyvgrmro
--
-- Auth model: Supabase Auth email+password, signup disabled (ADR-005).
-- Students authenticate and read published content; concierge writes use
-- service role outside the mobile app.

-- 1. Enable RLS on every application table exposed to the Data API.
--------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.weeks enable row level security;
alter table public.videos enable row level security;
alter table public.tags enable row level security;
alter table public.video_tags enable row level security;
alter table public.video_views enable row level security;

-- Force RLS even for table owners (defense in depth).
alter table public.profiles force row level security;
alter table public.weeks force row level security;
alter table public.videos force row level security;
alter table public.tags force row level security;
alter table public.video_tags force row level security;
alter table public.video_views force row level security;

-- 2. Content tables: SELECT only for authenticated users.
--------------------------------------------------------------------------------

-- Weeks are readable by any authenticated student.
create policy "weeks_select_authenticated"
  on public.weeks
  for select
  to authenticated
  using (true);

-- Videos are readable by any authenticated student.
create policy "videos_select_authenticated"
  on public.videos
  for select
  to authenticated
  using (true);

-- Tags are readable by any authenticated student.
create policy "tags_select_authenticated"
  on public.tags
  for select
  to authenticated
  using (true);

-- Video/tag junction is readable by any authenticated student.
create policy "video_tags_select_authenticated"
  on public.video_tags
  for select
  to authenticated
  using (true);

-- Profiles: each student can only read their own display name.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- 3. video_views: students can only insert/read their own view events.
--------------------------------------------------------------------------------

-- Students can insert a view event only when the row belongs to them.
create policy "video_views_insert_own"
  on public.video_views
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Students can read only their own view history.
create policy "video_views_select_own"
  on public.video_views
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 4. Grant only the privileges required by the Data API.
--    No UPDATE or DELETE grants for student roles.
--------------------------------------------------------------------------------
grant select on table public.weeks to authenticated;
grant select on table public.videos to authenticated;
grant select on table public.tags to authenticated;
grant select on table public.video_tags to authenticated;
grant select on table public.profiles to authenticated;

grant select, insert on table public.video_views to authenticated;

-- Explicitly revoke write access on content tables from student roles.
revoke update, delete, insert on table public.weeks from authenticated;
revoke update, delete, insert on table public.videos from authenticated;
revoke update, delete, insert on table public.tags from authenticated;
revoke update, delete, insert on table public.video_tags from authenticated;
revoke update, delete, insert on table public.profiles from authenticated;
revoke update, delete on table public.video_views from authenticated;
