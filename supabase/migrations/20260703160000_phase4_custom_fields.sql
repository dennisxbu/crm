-- Phase 4: Custom Fields Core — metadata-driven field definitions, options, typed values

-- ---------------------------------------------------------------------------
-- 1. custom_fields
-- ---------------------------------------------------------------------------

create table public.custom_fields (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null,
  name text not null,
  key text not null,
  description text,
  field_type text not null,
  placeholder text,
  help_text text,
  is_required boolean not null default false,
  is_unique boolean not null default false,
  is_system boolean not null default false,
  is_hidden boolean not null default false,
  is_archived boolean not null default false,
  default_value_json jsonb,
  validation_json jsonb not null default '{}'::jsonb,
  display_json jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint custom_fields_name_not_empty check (length(trim(name)) > 0),
  constraint custom_fields_key_not_empty check (length(trim(key)) > 0),
  constraint custom_fields_key_format check (key ~ '^[a-z][a-z0-9_]*$'),

  constraint custom_fields_entity_type_check check (
    entity_type in ('company', 'contact', 'deal')
  ),

  constraint custom_fields_field_type_check check (
    field_type in (
      'text',
      'long_text',
      'number',
      'currency',
      'date',
      'datetime',
      'boolean',
      'checkbox',
      'select',
      'multi_select',
      'email',
      'phone',
      'url',
      'percentage',
      'rating',
      'user',
      'relation'
    )
  )
);

comment on table public.custom_fields is
  'User-defined field metadata per workspace and entity type (Phase 4).';

create unique index custom_fields_workspace_entity_key_active_uidx
  on public.custom_fields (workspace_id, entity_type, key)
  where not is_archived;

create index custom_fields_workspace_entity_order_idx
  on public.custom_fields (workspace_id, entity_type, order_index);

create index custom_fields_workspace_entity_archived_idx
  on public.custom_fields (workspace_id, entity_type, is_archived);

create index custom_fields_workspace_field_type_idx
  on public.custom_fields (workspace_id, field_type);

create trigger custom_fields_updated_at
  before update on public.custom_fields
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 2. custom_field_options
-- ---------------------------------------------------------------------------

create table public.custom_field_options (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  custom_field_id uuid not null references public.custom_fields (id) on delete cascade,
  label text not null,
  value text not null,
  color text,
  order_index integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint custom_field_options_label_not_empty check (length(trim(label)) > 0),
  constraint custom_field_options_value_not_empty check (length(trim(value)) > 0),
  constraint custom_field_options_value_format check (value ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.custom_field_options is
  'Options for select and multi_select custom fields.';

create unique index custom_field_options_field_value_active_uidx
  on public.custom_field_options (custom_field_id, value)
  where not is_archived;

create index custom_field_options_workspace_field_order_idx
  on public.custom_field_options (workspace_id, custom_field_id, order_index);

create index custom_field_options_field_archived_idx
  on public.custom_field_options (custom_field_id, is_archived);

create trigger custom_field_options_updated_at
  before update on public.custom_field_options
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3. custom_field_values
-- ---------------------------------------------------------------------------

create table public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  custom_field_id uuid not null references public.custom_fields (id) on delete cascade,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_date date,
  value_datetime timestamptz,
  value_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint custom_field_values_entity_type_check check (
    entity_type in ('company', 'contact', 'deal')
  ),

  constraint custom_field_values_unique_entity_field unique (
    workspace_id,
    entity_type,
    entity_id,
    custom_field_id
  )
);

comment on table public.custom_field_values is
  'Typed custom field values per entity. Empty values are removed (delete row), not stored as null blobs.';

create index custom_field_values_workspace_entity_idx
  on public.custom_field_values (workspace_id, entity_type, entity_id);

create index custom_field_values_workspace_field_idx
  on public.custom_field_values (workspace_id, custom_field_id);

create index custom_field_values_field_text_idx
  on public.custom_field_values (custom_field_id, value_text);

create index custom_field_values_field_number_idx
  on public.custom_field_values (custom_field_id, value_number);

create index custom_field_values_field_date_idx
  on public.custom_field_values (custom_field_id, value_date);

create index custom_field_values_field_datetime_idx
  on public.custom_field_values (custom_field_id, value_datetime);

create index custom_field_values_field_json_gin_idx
  on public.custom_field_values using gin (value_json);

create trigger custom_field_values_updated_at
  before update on public.custom_field_values
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Cross-table consistency triggers
-- ---------------------------------------------------------------------------

create or replace function public.enforce_custom_field_option_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  field_workspace_id uuid;
begin
  select cf.workspace_id
  into field_workspace_id
  from public.custom_fields cf
  where cf.id = new.custom_field_id;

  if field_workspace_id is null then
    raise exception 'Custom field not found';
  end if;

  if new.workspace_id <> field_workspace_id then
    raise exception 'Option workspace_id must match custom field workspace_id';
  end if;

  return new;
end;
$$;

create trigger custom_field_options_workspace_check
  before insert or update on public.custom_field_options
  for each row
  execute function public.enforce_custom_field_option_workspace();

create or replace function public.enforce_custom_field_value_consistency()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  field_workspace_id uuid;
  field_entity_type text;
begin
  select cf.workspace_id, cf.entity_type
  into field_workspace_id, field_entity_type
  from public.custom_fields cf
  where cf.id = new.custom_field_id;

  if field_workspace_id is null then
    raise exception 'Custom field not found';
  end if;

  if new.workspace_id <> field_workspace_id then
    raise exception 'Value workspace_id must match custom field workspace_id';
  end if;

  if new.entity_type <> field_entity_type then
    raise exception 'Value entity_type must match custom field entity_type';
  end if;

  return new;
end;
$$;

create trigger custom_field_values_consistency_check
  before insert or update on public.custom_field_values
  for each row
  execute function public.enforce_custom_field_value_consistency();

-- ---------------------------------------------------------------------------
-- 5. Row level security
-- ---------------------------------------------------------------------------

alter table public.custom_fields enable row level security;
alter table public.custom_field_options enable row level security;
alter table public.custom_field_values enable row level security;

create policy "Workspace members can select custom fields"
  on public.custom_fields
  for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert custom fields"
  on public.custom_fields
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update custom fields"
  on public.custom_fields
  for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can select custom field options"
  on public.custom_field_options
  for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert custom field options"
  on public.custom_field_options
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update custom field options"
  on public.custom_field_options
  for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can select custom field values"
  on public.custom_field_values
  for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert custom field values"
  on public.custom_field_values
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update custom field values"
  on public.custom_field_values
  for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can delete custom field values"
  on public.custom_field_values
  for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- 6. Grants
-- ---------------------------------------------------------------------------

grant select, insert, update on table public.custom_fields to authenticated;
grant select, insert, update on table public.custom_field_options to authenticated;
grant select, insert, update, delete on table public.custom_field_values to authenticated;

grant all on table public.custom_fields to service_role;
grant all on table public.custom_field_options to service_role;
grant all on table public.custom_field_values to service_role;

-- ---------------------------------------------------------------------------
-- 7. Default company custom fields (seed via RPC, not frontend constants)
-- ---------------------------------------------------------------------------

create or replace function public.ensure_default_company_custom_fields(
  target_workspace_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  field_id uuid;
begin
  if not public.is_workspace_member(target_workspace_id) then
    raise exception 'Not a workspace member';
  end if;

  -- lead_source (select)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index
  )
  values (
    target_workspace_id, 'company', 'Quelle', 'lead_source', 'select', true, 10
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  select id into field_id
  from public.custom_fields
  where workspace_id = target_workspace_id
    and entity_type = 'company'
    and key = 'lead_source';

  if field_id is not null then
    insert into public.custom_field_options (workspace_id, custom_field_id, label, value, order_index)
    values
      (target_workspace_id, field_id, 'LinkedIn', 'linkedin', 10),
      (target_workspace_id, field_id, 'Google', 'google', 20),
      (target_workspace_id, field_id, 'Branchenliste', 'branchenliste', 30),
      (target_workspace_id, field_id, 'Empfehlung', 'empfehlung', 40),
      (target_workspace_id, field_id, 'Website', 'website', 50),
      (target_workspace_id, field_id, 'Sonstiges', 'sonstiges', 60)
    on conflict (custom_field_id, value) where not is_archived do nothing;
  end if;

  -- lead_source_detail (text)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index
  )
  values (
    target_workspace_id, 'company', 'Quellen-Details', 'lead_source_detail', 'text', true, 20
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  -- research_status (select)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index
  )
  values (
    target_workspace_id, 'company', 'Recherche-Status', 'research_status', 'select', true, 30
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  select id into field_id
  from public.custom_fields
  where workspace_id = target_workspace_id
    and entity_type = 'company'
    and key = 'research_status';

  if field_id is not null then
    insert into public.custom_field_options (workspace_id, custom_field_id, label, value, order_index)
    values
      (target_workspace_id, field_id, 'Nicht gestartet', 'nicht_gestartet', 10),
      (target_workspace_id, field_id, 'In Recherche', 'in_recherche', 20),
      (target_workspace_id, field_id, 'Impressum geprüft', 'impressum_geprueft', 30),
      (target_workspace_id, field_id, 'LinkedIn geprüft', 'linkedin_geprueft', 40),
      (target_workspace_id, field_id, 'Entscheider gefunden', 'entscheider_gefunden', 50),
      (target_workspace_id, field_id, 'Kein passender Kontakt gefunden', 'kein_passender_kontakt', 60)
    on conflict (custom_field_id, value) where not is_archived do nothing;
  end if;

  -- priority (select)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index
  )
  values (
    target_workspace_id, 'company', 'Priorität', 'priority', 'select', true, 40
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  select id into field_id
  from public.custom_fields
  where workspace_id = target_workspace_id
    and entity_type = 'company'
    and key = 'priority';

  if field_id is not null then
    insert into public.custom_field_options (workspace_id, custom_field_id, label, value, order_index)
    values
      (target_workspace_id, field_id, 'Hoch', 'hoch', 10),
      (target_workspace_id, field_id, 'Mittel', 'mittel', 20),
      (target_workspace_id, field_id, 'Niedrig', 'niedrig', 30)
    on conflict (custom_field_id, value) where not is_archived do nothing;
  end if;

  -- fit_score (rating)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index, validation_json
  )
  values (
    target_workspace_id,
    'company',
    'Fit Score',
    'fit_score',
    'rating',
    true,
    50,
    '{"max": 5}'::jsonb
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  -- pain_score (rating)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index, validation_json
  )
  values (
    target_workspace_id,
    'company',
    'Pain Score',
    'pain_score',
    'rating',
    true,
    60,
    '{"max": 5}'::jsonb
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  -- call_attempt_count (number)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index, validation_json
  )
  values (
    target_workspace_id,
    'company',
    'Anrufversuche',
    'call_attempt_count',
    'number',
    true,
    70,
    '{"min": 0}'::jsonb
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  -- last_call_outcome (select)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index
  )
  values (
    target_workspace_id, 'company', 'Letztes Anrufergebnis', 'last_call_outcome', 'select', true, 80
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  select id into field_id
  from public.custom_fields
  where workspace_id = target_workspace_id
    and entity_type = 'company'
    and key = 'last_call_outcome';

  if field_id is not null then
    insert into public.custom_field_options (workspace_id, custom_field_id, label, value, order_index)
    values
      (target_workspace_id, field_id, 'Nicht erreicht', 'nicht_erreicht', 10),
      (target_workspace_id, field_id, 'Rückruf vereinbart', 'rueckruf_vereinbart', 20),
      (target_workspace_id, field_id, 'Kein Interesse', 'kein_interesse', 30),
      (target_workspace_id, field_id, 'Falscher Ansprechpartner', 'falscher_ansprechpartner', 40),
      (target_workspace_id, field_id, 'Gespräch geführt', 'gespraech_gefuehrt', 50),
      (target_workspace_id, field_id, 'Mail gewünscht', 'mail_gewuenscht', 60)
    on conflict (custom_field_id, value) where not is_archived do nothing;
  end if;

  -- disqualification_reason (select)
  insert into public.custom_fields (
    workspace_id, entity_type, name, key, field_type, is_system, order_index
  )
  values (
    target_workspace_id,
    'company',
    'Disqualifizierungsgrund',
    'disqualification_reason',
    'select',
    true,
    90
  )
  on conflict (workspace_id, entity_type, key) where not is_archived do nothing;

  select id into field_id
  from public.custom_fields
  where workspace_id = target_workspace_id
    and entity_type = 'company'
    and key = 'disqualification_reason';

  if field_id is not null then
    insert into public.custom_field_options (workspace_id, custom_field_id, label, value, order_index)
    values
      (target_workspace_id, field_id, 'Zu klein', 'zu_klein', 10),
      (target_workspace_id, field_id, 'Kein Bedarf', 'kein_bedarf', 20),
      (target_workspace_id, field_id, 'Nicht erreichbar', 'nicht_erreichbar', 30),
      (target_workspace_id, field_id, 'Falsche Zielgruppe', 'falsche_zielgruppe', 40),
      (target_workspace_id, field_id, 'Bereits Kunde', 'bereits_kunde', 50),
      (target_workspace_id, field_id, 'Sonstiges', 'sonstiges', 60)
    on conflict (custom_field_id, value) where not is_archived do nothing;
  end if;
end;
$$;

grant execute on function public.ensure_default_company_custom_fields(uuid) to authenticated;

-- Hook default fields into new workspace creation
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

  return new_workspace_id;
end;
$$;
