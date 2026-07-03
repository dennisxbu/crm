-- Phase 5: views table — metadata-driven table/kanban view configuration

-- ---------------------------------------------------------------------------
-- 1. views table
-- ---------------------------------------------------------------------------

create table public.views (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  entity_type text not null,
  view_type text not null,
  is_default boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint views_name_not_empty check (length(trim(name)) > 0),

  constraint views_entity_type_check check (
    entity_type in ('company', 'deal')
  ),

  constraint views_view_type_check check (
    view_type in ('table', 'kanban')
  )
);

comment on table public.views is
  'Saved view configuration for table and kanban (Phase 5: company table only in app).';

create index views_workspace_entity_type_sort_idx
  on public.views (workspace_id, entity_type, view_type, sort_order);

create unique index views_workspace_entity_view_type_default_uidx
  on public.views (workspace_id, entity_type, view_type)
  where is_default;

create trigger views_updated_at
  before update on public.views
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 2. row level security
-- ---------------------------------------------------------------------------

alter table public.views enable row level security;

create policy "Workspace members can select views"
  on public.views
  for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert views"
  on public.views
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update views"
  on public.views
  for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can delete views"
  on public.views
  for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- 3. grants
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on table public.views to authenticated;
grant all on table public.views to service_role;

-- ---------------------------------------------------------------------------
-- 4. default company table view seed
-- ---------------------------------------------------------------------------

create or replace function public.ensure_default_company_table_view(
  target_workspace_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_view_id uuid;
  new_view_id uuid;
begin
  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Not a workspace member';
  end if;

  select v.id
  into existing_view_id
  from public.views v
  where v.workspace_id = target_workspace_id
    and v.entity_type = 'company'
    and v.view_type = 'table'
    and v.is_default = true
  limit 1;

  if existing_view_id is not null then
    return existing_view_id;
  end if;

  insert into public.views (
    workspace_id,
    name,
    entity_type,
    view_type,
    is_default,
    sort_order,
    config
  )
  values (
    target_workspace_id,
    'Unternehmen — Tabelle',
    'company',
    'table',
    true,
    0,
    jsonb_build_object(
      'columns',
      jsonb_build_array(
        jsonb_build_object('field_ref', 'system:name', 'width', 260, 'visible', true),
        jsonb_build_object('field_ref', 'system:website', 'width', 180, 'visible', true),
        jsonb_build_object(
          'field_ref',
          'system:contact_discovery_status',
          'width',
          180,
          'visible',
          true
        ),
        jsonb_build_object('field_ref', 'system:created_at', 'width', 160, 'visible', true)
      ),
      'sort',
      jsonb_build_array(
        jsonb_build_object('field_ref', 'system:created_at', 'direction', 'desc')
      ),
      'filters',
      jsonb_build_array()
    )
  )
  returning id into new_view_id;

  return new_view_id;
end;
$$;

grant execute on function public.ensure_default_company_table_view(uuid) to authenticated;

-- Hook into workspace creation alongside default custom fields
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

  perform public.ensure_default_company_custom_fields(new_workspace_id);
  perform public.ensure_default_company_table_view(new_workspace_id);

  return new_workspace_id;
end;
$$;
