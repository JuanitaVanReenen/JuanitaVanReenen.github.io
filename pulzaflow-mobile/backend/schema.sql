-- PULZA FLOW production database foundation
-- Run this in the Supabase SQL Editor after creating the project.
-- RLS is enabled on every user-facing table.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.pulzas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  kind text not null default 'pulza' check (kind in ('post','pulza')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulza_options (
  id uuid primary key default gen_random_uuid(),
  pulza_id uuid not null references public.pulzas(id) on delete cascade,
  option_text text not null check (char_length(option_text) between 1 and 300),
  position integer not null,
  unique(pulza_id, position)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  pulza_id uuid not null references public.pulzas(id) on delete cascade,
  option_id uuid not null references public.pulza_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(pulza_id, user_id)
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  pulza_id uuid not null references public.pulzas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (char_length(reaction) between 1 and 40),
  created_at timestamptz not null default now(),
  unique(pulza_id, user_id, reaction)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  pulza_id uuid not null references public.pulzas(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  pulza_id uuid references public.pulzas(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 500),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  check (pulza_id is not null or reported_user_id is not null)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  pulza_id uuid references public.pulzas(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','plus')),
  status text not null default 'inactive' check (status in ('inactive','trialing','active','past_due','cancelled')),
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  store text check (store in ('apple','google')),
  product_id text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.pulzas enable row level security;
alter table public.pulza_options enable row level security;
alter table public.votes enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles: public read; users control their own profile.
create policy "profiles_read" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Public feed data, with ownership on writes.
create policy "pulzas_read" on public.pulzas for select using (true);
create policy "pulzas_insert_own" on public.pulzas for insert with check (auth.uid() = author_id);
create policy "pulzas_update_own" on public.pulzas for update using (auth.uid() = author_id);
create policy "pulzas_delete_own" on public.pulzas for delete using (auth.uid() = author_id);

create policy "options_read" on public.pulza_options for select using (true);
create policy "options_manage_own" on public.pulza_options for all
using (exists (select 1 from public.pulzas p where p.id = pulza_id and p.author_id = auth.uid()))
with check (exists (select 1 from public.pulzas p where p.id = pulza_id and p.author_id = auth.uid()));

create policy "votes_read" on public.votes for select using (true);
create policy "votes_insert_own" on public.votes for insert with check (auth.uid() = user_id);
create policy "votes_delete_own" on public.votes for delete using (auth.uid() = user_id);

create policy "reactions_read" on public.reactions for select using (true);
create policy "reactions_insert_own" on public.reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete_own" on public.reactions for delete using (auth.uid() = user_id);

create policy "comments_read" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_update_own" on public.comments for update using (auth.uid() = author_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = author_id);

create policy "follows_read" on public.follows for select using (true);
create policy "follows_insert_own" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_own" on public.follows for delete using (auth.uid() = follower_id);

create policy "blocks_read_own" on public.blocks for select using (auth.uid() = blocker_id);
create policy "blocks_insert_own" on public.blocks for insert with check (auth.uid() = blocker_id);
create policy "blocks_delete_own" on public.blocks for delete using (auth.uid() = blocker_id);

create policy "reports_insert_own" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports_read_own" on public.reports for select using (auth.uid() = reporter_id);

create policy "notifications_read_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);

create policy "subscriptions_read_own" on public.subscriptions for select using (auth.uid() = user_id);

-- Create a profile row when a new account is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''), 'user_' || substr(new.id::text,1,8)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), 'New User')
  )
  on conflict (id) do nothing;
  insert into public.subscriptions (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Media metadata belongs in application tables; binary files live in Supabase Storage.
create table if not exists public.pulza_media (
  id uuid primary key default gen_random_uuid(),
  pulza_id uuid not null references public.pulzas(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image','video')),
  mime_type text,
  created_at timestamptz not null default now()
);

alter table public.pulza_media enable row level security;

create policy "pulza_media_read" on public.pulza_media
for select using (true);

create policy "pulza_media_insert_own" on public.pulza_media
for insert with check (auth.uid() = owner_id);

create policy "pulza_media_delete_own" on public.pulza_media
for delete using (auth.uid() = owner_id);

-- Storage setup:
-- Create a bucket named "pulza-media" in Supabase Storage.
-- Do not modify storage schema tables directly.
-- Apply Storage RLS policies so authenticated users can upload only
-- to the first folder matching their auth.uid().

-- Enable Realtime for the interaction/notification tables used by the app.
-- Supabase Realtime must also be enabled for these tables in the project.
do $$
begin
  alter publication supabase_realtime add table public.reactions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;


-- Create activity notifications for social interactions.
create or replace function public.create_pulza_activity_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
  actor_user uuid;
  target_pulza uuid;
  activity_type text;
begin
  if tg_table_name = 'reactions' then
    actor_user := new.user_id;
    target_pulza := new.pulza_id;
    activity_type := 'reaction';
  elsif tg_table_name = 'comments' then
    actor_user := new.author_id;
    target_pulza := new.pulza_id;
    activity_type := 'comment';
  elsif tg_table_name = 'votes' then
    actor_user := new.user_id;
    target_pulza := new.pulza_id;
    activity_type := 'vote';
  elsif tg_table_name = 'follows' then
    actor_user := new.follower_id;
    target_user := new.following_id;
    activity_type := 'follow';
  else
    return new;
  end if;

  if target_user is null then
    select author_id into target_user
    from public.pulzas
    where id = target_pulza;
  end if;

  if target_user is not null and target_user <> actor_user then
    insert into public.notifications (user_id, actor_id, type, pulza_id)
    values (target_user, actor_user, activity_type, target_pulza);
  end if;

  return new;
end;
$$;

drop trigger if exists reactions_activity_notification on public.reactions;
create trigger reactions_activity_notification
after insert on public.reactions
for each row execute procedure public.create_pulza_activity_notification();

drop trigger if exists comments_activity_notification on public.comments;
create trigger comments_activity_notification
after insert on public.comments
for each row execute procedure public.create_pulza_activity_notification();

drop trigger if exists votes_activity_notification on public.votes;
create trigger votes_activity_notification
after insert on public.votes
for each row execute procedure public.create_pulza_activity_notification();

drop trigger if exists follows_activity_notification on public.follows;
create trigger follows_activity_notification
after insert on public.follows
for each row execute procedure public.create_pulza_activity_notification();


-- Moderation roles and auditable moderation actions.
create table if not exists public.moderator_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'moderator' check (role in ('moderator','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles(id) on delete restrict,
  report_id uuid references public.reports(id) on delete set null,
  pulza_id uuid references public.pulzas(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('reviewed','resolved','dismissed','content_removed','user_restricted','user_suspended')),
  note text default '',
  created_at timestamptz not null default now()
);

alter table public.moderator_roles enable row level security;
alter table public.moderation_actions enable row level security;

-- These tables are intentionally not readable/writable by ordinary app users.
-- Admin/moderator policies must be added through a server-side role check or
-- protected admin API; never grant moderation access based on a client flag.

alter table public.profiles add column if not exists account_status text not null default 'active'
  check (account_status in ('active','restricted','suspended'));


-- Prevent ordinary authenticated clients from writing moderation administration data.
-- The actual moderator/admin write API should use a server-side role check.
-- These policies deliberately do not grant public access.
create policy "moderator_roles_read_self"
on public.moderator_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "moderation_actions_read_self"
on public.moderation_actions for select
to authenticated
using (auth.uid() = moderator_id);


-- Policy acceptance records. Version values are controlled by the released
-- app/backend, not by the client.
create table if not exists public.policy_acceptances (
  user_id uuid not null references public.profiles(id) on delete cascade,
  terms_version text not null,
  guidelines_version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, terms_version, guidelines_version)
);

alter table public.policy_acceptances enable row level security;

create policy "policy_acceptances_read_own"
on public.policy_acceptances for select
to authenticated
using (auth.uid() = user_id);

create policy "policy_acceptances_insert_own"
on public.policy_acceptances for insert
to authenticated
with check (auth.uid() = user_id);
