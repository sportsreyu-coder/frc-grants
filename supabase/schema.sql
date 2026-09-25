-- FRC Hub — database schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
--
-- Written for a project with "Automatically expose new tables" turned OFF
-- (Settings -> API -> the Data API security toggles) -- so the table gets
-- an explicit grant below instead of relying on that default. RLS still
-- does the actual per-row access control; the grant just lets the
-- authenticated role reach the table at all.

grant usage on schema public to authenticated;

-- One row per signed-in user, holding their entire Season Tracker state
-- (milestone/task progress, custom events, subteam roster, mechanisms,
-- team members, task assignments) as a single JSON blob -- see
-- js/season.js's currentStateSnapshot()/applyCloudSnapshot() for the
-- exact shape. A single JSONB column is deliberate here: this data is
-- always read/written as one unit per user, never queried by field, so a
-- fully normalized schema would just add migration overhead with no
-- benefit.
create table if not exists public.season_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.season_data enable row level security;

create policy "Users can view their own season data"
  on public.season_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own season data"
  on public.season_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own season data"
  on public.season_data for update
  using (auth.uid() = user_id);

grant select, insert, update on public.season_data to authenticated;
