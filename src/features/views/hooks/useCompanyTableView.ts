import { useCallback, useEffect, useState } from "react";
import { loadCompanyTableView } from "../api/views";
import type { View } from "../view.types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Tabellenansicht konnte nicht geladen werden.";
}

export function useCompanyTableView(workspaceId: string | undefined) {
  const [view, setView] = useState<View | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setView(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextView = await loadCompanyTableView(workspaceId);
      setView(nextView);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setView(null);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    view,
    isLoading,
    error,
    refresh,
  };
}
