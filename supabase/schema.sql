-- FRC Hub Pro — database schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

-- One row per team account, keyed to the Supabase auth user id.
create table if not exists public.teams (
  id uuid primary key references auth.users (id) on delete cascade,
  team_number text,
  team_name text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;

create policy "Teams can view their own row"
  on public.teams for select
  using (auth.uid() = id);

create policy "Teams can insert their own row"
  on public.teams for insert
  with check (auth.uid() = id);

create policy "Teams can update their own row"
  on public.teams for update
  using (auth.uid() = id);

-- Metadata for the three required documents per team.
create table if not exists public.team_documents (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  doc_type text not null check (doc_type in ('registration_proof', 'budget_plan', 'tax_exempt_proof')),
  storage_path text not null,
  original_filename text,
  uploaded_at timestamptz not null default now()
);

alter table public.team_documents enable row level security;

create policy "Teams can view their own documents"
  on public.team_documents for select
  using (auth.uid() = team_id);

create policy "Teams can insert their own documents"
  on public.team_documents for insert
  with check (auth.uid() = team_id);

create policy "Teams can delete their own documents"
  on public.team_documents for delete
  using (auth.uid() = team_id);

-- Storage bucket for the uploaded files. Private — accessed only via
-- signed URLs / the authenticated owner, never public.
insert into storage.buckets (id, name, public)
values ('team-documents', 'team-documents', false)
on conflict (id) do nothing;

create policy "Teams can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'team-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Teams can read their own folder"
  on storage.objects for select
  using (
    bucket_id = 'team-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Teams can delete their own folder"
  on storage.objects for delete
  using (
    bucket_id = 'team-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
