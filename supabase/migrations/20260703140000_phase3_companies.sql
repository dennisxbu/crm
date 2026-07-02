-- Phase 3: companies table — primary lead object (company-first, workspace-scoped)

-- ---------------------------------------------------------------------------
-- 1. companies table
-- ---------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  website text,
  domain text,
  linkedin_url text,
  phone text,
  email text,
  city text,
  country text default 'DE',
  industry text,
  employee_count_range text,
  contact_discovery_status text not null default 'unknown',
  lifecycle_status text not null default 'lead',
  owner_id uuid references public.profiles (id) on delete set null,
  next_action_at timestamptz,
  last_activity_at timestamptz,
  last_contacted_at timestamptz,
  notes_summary text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,

  constraint companies_name_not_empty check (length(trim(name)) > 0),

  constraint companies_contact_discovery_status_check check (
    contact_discovery_status in (
      'unknown',
      'not_started',
      'researching',
      'partial_contacts_found',
      'decision_maker_identified',
      'no_contact_found'
    )
  ),

  constraint companies_lifecycle_status_check check (
    lifecycle_status in (
      'lead',
      'prospect',
      'active_opportunity',
      'customer',
      'disqualified',
      'archived'
    )
  )
);

comment on table public.companies is
  'Primary B2B lead object. Companies exist without contacts or deals (Phase 3).';

-- ---------------------------------------------------------------------------
-- 2. indexes
-- ---------------------------------------------------------------------------

create index companies_workspace_created_at_idx
  on public.companies (workspace_id, created_at desc);

create index companies_workspace_archived_at_idx
  on public.companies (workspace_id, archived_at);

create index companies_workspace_lifecycle_status_idx
  on public.companies (workspace_id, lifecycle_status);

create index companies_workspace_contact_discovery_status_idx
  on public.companies (workspace_id, contact_discovery_status);

create index companies_workspace_owner_id_idx
  on public.companies (workspace_id, owner_id);

create index companies_workspace_name_lower_idx
  on public.companies (workspace_id, lower(name));

-- ---------------------------------------------------------------------------
-- 3. updated_at trigger
-- ---------------------------------------------------------------------------

create trigger companies_updated_at
  before update on public.companies
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 4. row level security
-- ---------------------------------------------------------------------------

alter table public.companies enable row level security;

create policy "Workspace members can select companies"
  on public.companies
  for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert companies"
  on public.companies
  for insert
  to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and (created_by is null or created_by = auth.uid())
    and (
      owner_id is null
      or owner_id = auth.uid()
    )
  );

create policy "Workspace members can update companies"
  on public.companies
  for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (
    public.is_workspace_member(workspace_id)
    and (
      owner_id is null
      or owner_id = auth.uid()
    )
  );

-- No delete policy for authenticated in Phase 3 — archive via archived_at instead.

-- ---------------------------------------------------------------------------
-- 5. grants
-- ---------------------------------------------------------------------------

grant select, insert, update on table public.companies to authenticated;
grant all on table public.companies to service_role;
