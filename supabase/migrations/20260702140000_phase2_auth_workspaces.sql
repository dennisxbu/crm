-- Phase 2: Auth onboarding, workspaces, workspace memberships, RLS helpers

-- ---------------------------------------------------------------------------
-- 1. Auto-create profile on auth.users insert
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. Workspaces
-- ---------------------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workspaces is 'Top-level tenant boundary for CRM data. Phase 2 foundation.';

create trigger workspaces_updated_at
  before update on public.workspaces
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Workspace members
-- ---------------------------------------------------------------------------

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

comment on table public.workspace_members is 'Links profiles to workspaces with a role.';

create index workspace_members_user_id_idx on public.workspace_members (user_id);

-- ---------------------------------------------------------------------------
-- 4. RLS helper functions (security definer avoids policy recursion)
-- ---------------------------------------------------------------------------

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. Initial workspace RPC (idempotent onboarding)
-- ---------------------------------------------------------------------------

create or replace function public.create_initial_workspace(workspace_name text default 'Blumenthal Systems')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  existing_workspace_id uuid;
  new_workspace_id uuid;
  base_slug text;
  final_slug text;
  slug_suffix int;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Fallback: ensure profile exists if auth trigger did not run yet
  insert into public.profiles (id, email, full_name)
  select
    u.id,
    u.email,
    nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), '')
  from auth.users u
  where u.id = current_user_id
  on conflict (id) do nothing;

  select wm.workspace_id
  into existing_workspace_id
  from public.workspace_members wm
  where wm.user_id = current_user_id
  order by wm.created_at asc
  limit 1;

  if existing_workspace_id is not null then
    return existing_workspace_id;
  end if;

  base_slug := lower(regexp_replace(workspace_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);

  if base_slug = '' then
    base_slug := 'workspace';
  end if;

  final_slug := base_slug;
  slug_suffix := 0;

  while exists (
    select 1 from public.workspaces w where w.slug = final_slug
  ) loop
    slug_suffix := slug_suffix + 1;
    final_slug := base_slug || '-' || slug_suffix::text;
  end loop;

  insert into public.workspaces (name, slug)
  values (workspace_name, final_slug)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, current_user_id, 'owner');

  return new_workspace_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- profiles: phase 1 policies remain (own profile read/update/insert)

create policy "Members can select their workspaces"
  on public.workspaces
  for select
  to authenticated
  using (public.is_workspace_member(id));

create policy "Owners can update their workspace"
  on public.workspaces
  for update
  to authenticated
  using (public.is_workspace_owner(id))
  with check (public.is_workspace_owner(id));

create policy "Users can select own memberships"
  on public.workspace_members
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Members can select workspace memberships"
  on public.workspace_members
  for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- 7. Grants (auto_expose_new_tables is disabled)
-- ---------------------------------------------------------------------------

grant select, update on table public.workspaces to authenticated;
grant select on table public.workspace_members to authenticated;

grant all on table public.workspaces to service_role;
grant all on table public.workspace_members to service_role;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.create_initial_workspace(text) to authenticated;
