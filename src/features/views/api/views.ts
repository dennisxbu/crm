import { supabase } from "../../../shared/lib/supabase/client";
import type { View, ViewEntityType, ViewType } from "../view.types";
import { parseViewConfig } from "../view.utils";

const VIEW_COLUMNS =
  "id, workspace_id, name, entity_type, view_type, is_default, config, sort_order, created_at, updated_at";

function getClient() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase;
}

function mapViewRow(row: Record<string, unknown>): View {
  const config = parseViewConfig(row.config);

  if (!config) {
    throw new Error("Ungültige View-Konfiguration in der Datenbank.");
  }

  return {
    id: String(row.id),
    workspace_id: String(row.workspace_id),
    name: String(row.name),
    entity_type: row.entity_type as ViewEntityType,
    view_type: row.view_type as ViewType,
    is_default: Boolean(row.is_default),
    config,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function fetchDefaultCompanyTableView(
  workspaceId: string,
): Promise<View | null> {
  const client = getClient();

  const { data, error } = await client
    .from("views")
    .select(VIEW_COLUMNS)
    .eq("workspace_id", workspaceId)
    .eq("entity_type", "company")
    .eq("view_type", "table")
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapViewRow(data as Record<string, unknown>);
}

export async function ensureDefaultCompanyTableView(
  workspaceId: string,
): Promise<void> {
  const client = getClient();

  const { error } = await client.rpc("ensure_default_company_table_view", {
    target_workspace_id: workspaceId,
  });

  if (error) {
    throw error;
  }
}

export async function loadCompanyTableView(workspaceId: string): Promise<View> {
  let view = await fetchDefaultCompanyTableView(workspaceId);

  if (!view) {
    await ensureDefaultCompanyTableView(workspaceId);
    view = await fetchDefaultCompanyTableView(workspaceId);
  }

  if (!view) {
    throw new Error("Standard-Tabellenansicht konnte nicht geladen werden.");
  }

  return view;
}
