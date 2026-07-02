-- Security fix: tighten companies UPDATE RLS to enforce row-level ownership.
-- Blocks in-workspace privilege escalation when multiple members share a workspace.

-- ---------------------------------------------------------------------------
-- 1. Replace UPDATE policy — USING must match owner, not only membership
-- ---------------------------------------------------------------------------

drop policy if exists "Workspace members can update companies" on public.companies;

create policy "Workspace members can update companies"
  on public.companies
  for update
  to authenticated
  using (
    public.is_workspace_member(workspace_id)
    and (owner_id is null or owner_id = auth.uid())
  )
  with check (
    public.is_workspace_member(workspace_id)
    and (owner_id is null or owner_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 2. Trigger — prevent reassignment of immutable columns via direct UPDATE
-- ---------------------------------------------------------------------------

create or replace function public.prevent_companies_immutable_column_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.workspace_id is distinct from old.workspace_id then
    raise exception 'workspace_id cannot be changed';
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'created_by cannot be changed';
  end if;

  if new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id cannot be changed via direct update';
  end if;

  return new;
end;
$$;

create trigger companies_prevent_immutable_column_change
  before update on public.companies
  for each row
  execute function public.prevent_companies_immutable_column_change();

comment on function public.prevent_companies_immutable_column_change() is
  'Blocks owner_id/workspace_id/created_by changes on companies. Owner reassignment deferred to future RPC.';
