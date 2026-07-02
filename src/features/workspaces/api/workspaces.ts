import { supabase } from "../../../shared/lib/supabase/client";
import {
  ACTIVE_WORKSPACE_STORAGE_KEY,
  DEFAULT_WORKSPACE_NAME,
  type Workspace,
  type WorkspaceMember,
} from "../workspace.types";

type WorkspaceMemberRow = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceMember["role"];
  created_at: string;
  workspaces: Workspace | Workspace[] | null;
};

function normalizeMembership(row: WorkspaceMemberRow): WorkspaceMember {
  const workspace = Array.isArray(row.workspaces)
    ? (row.workspaces[0] ?? undefined)
    : (row.workspaces ?? undefined);

  return {
    workspace_id: row.workspace_id,
    user_id: row.user_id,
    role: row.role,
    created_at: row.created_at,
    workspace,
  };
}

export async function fetchMemberships(
  userId: string,
): Promise<WorkspaceMember[]> {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      workspace_id,
      user_id,
      role,
      created_at,
      workspaces (
        id,
        name,
        slug,
        created_at,
        updated_at
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as WorkspaceMemberRow[]).map(normalizeMembership);
}

export async function ensureInitialWorkspace(): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const { data, error } = await supabase.rpc("create_initial_workspace", {
    workspace_name: DEFAULT_WORKSPACE_NAME,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Initial workspace RPC returned no workspace id.");
  }

  return data;
}

export function resolveActiveWorkspace(
  memberships: WorkspaceMember[],
): Workspace | null {
  if (memberships.length === 0) {
    return null;
  }

  const storedWorkspaceId = localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
  const validMembership =
    memberships.find(
      (membership) => membership.workspace?.id === storedWorkspaceId,
    ) ?? memberships[0];

  const workspace = validMembership.workspace ?? null;

  if (workspace) {
    localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspace.id);
  }

  return workspace;
}

export function clearActiveWorkspaceStorage(): void {
  localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
}
