import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import {
  ensureInitialWorkspace,
  fetchMemberships,
  resolveActiveWorkspace,
  clearActiveWorkspaceStorage,
} from "../../features/workspaces/api/workspaces";
import type {
  Workspace,
  WorkspaceContextValue,
  WorkspaceMember,
} from "../../features/workspaces/workspace.types";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function getWorkspaceErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Workspace konnte nicht geladen werden.";
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null,
  );
  const [memberships, setMemberships] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspace = useCallback(async () => {
    if (!user) {
      setActiveWorkspace(null);
      setMemberships([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let nextMemberships = await fetchMemberships(user.id);

      if (nextMemberships.length === 0) {
        await ensureInitialWorkspace();
        nextMemberships = await fetchMemberships(user.id);
      }

      setMemberships(nextMemberships);
      setActiveWorkspace(resolveActiveWorkspace(nextMemberships));
    } catch (workspaceError) {
      setError(getWorkspaceErrorMessage(workspaceError));
      setActiveWorkspace(null);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setActiveWorkspace(null);
      setMemberships([]);
      setError(null);
      clearActiveWorkspaceStorage();
      return;
    }

    void refreshWorkspace();
  }, [user, refreshWorkspace]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeWorkspace,
      memberships,
      isLoading,
      error,
      refreshWorkspace,
    }),
    [activeWorkspace, memberships, isLoading, error, refreshWorkspace],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider.");
  }

  return context;
}
