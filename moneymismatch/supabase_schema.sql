-- MoneyMismatch production database schema
-- Run this in Supabase SQL Editor after creating a project.
create extension if not exists "pgcrypto";

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'trial' check (plan in ('trial','starter','business','professional','enterprise')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

create table if not exists public.comparisons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  source_filename text,
  payment_filename text,
  status text not null default 'completed',
  records_checked integer not null default 0,
  matched_count integer not null default 0,
  exception_count integer not null default 0,
  amount_affected numeric(18,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.exceptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  exception_type text not null,
  reference text,
  amount_affected numeric(18,2) not null default 0,
  evidence text not null,
  recommended_action text not null,
  status text not null default 'open' check (status in ('open','reviewed','resolved','ignored')),
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.comparisons enable row level security;
alter table public.exceptions enable row level security;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace and user_id = auth.uid()
  );
$$;

drop policy if exists "workspace members can read workspace" on public.workspaces;
create policy "workspace members can read workspace" on public.workspaces for select using (public.is_workspace_member(id));

drop policy if exists "members can read memberships" on public.workspace_members;
create policy "members can read memberships" on public.workspace_members for select using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists "members can read comparisons" on public.comparisons;
create policy "members can read comparisons" on public.comparisons for select using (public.is_workspace_member(workspace_id));

drop policy if exists "members can insert comparisons" on public.comparisons;
create policy "members can insert comparisons" on public.comparisons for insert with check (public.is_workspace_member(workspace_id));

drop policy if exists "members can read exceptions" on public.exceptions;
create policy "members can read exceptions" on public.exceptions for select using (public.is_workspace_member(workspace_id));

drop policy if exists "members can insert exceptions" on public.exceptions;
create policy "members can insert exceptions" on public.exceptions for insert with check (public.is_workspace_member(workspace_id));

-- Do not store raw uploaded financial files in the public website repository.
-- Production file storage should use a private bucket with workspace-scoped access.
