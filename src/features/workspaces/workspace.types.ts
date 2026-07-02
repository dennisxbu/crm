export type WorkspaceRole = "owner" | "member";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  workspace?: Workspace;
};

export type WorkspaceContextValue = {
  activeWorkspace: Workspace | null;
  memberships: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;
  refreshWorkspace: () => Promise<void>;
};

export const ACTIVE_WORKSPACE_STORAGE_KEY = "crm_active_workspace_id";

export const DEFAULT_WORKSPACE_NAME = "Blumenthal Systems";
