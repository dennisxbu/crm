import { useCallback, useEffect, useState } from "react";
import {
  archiveCompany as archiveCompanyRequest,
  createCompany as createCompanyRequest,
  fetchCompanies,
  fetchCompanyById,
  updateCompany as updateCompanyRequest,
} from "../api/companies";
import type {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
} from "../company.types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unternehmen konnten nicht geladen werden.";
}

export function useCompanies(
  workspaceId: string | undefined,
  userId: string | undefined,
) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCompanies = useCallback(async () => {
    if (!workspaceId) {
      setCompanies([]);
      setSelectedCompany(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextCompanies = await fetchCompanies(workspaceId);
      setCompanies(nextCompanies);
      setSelectedCompany((current) => {
        if (!current) {
          return null;
        }

        return (
          nextCompanies.find((company) => company.id === current.id) ?? null
        );
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setCompanies([]);
      setSelectedCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refreshCompanies();
  }, [refreshCompanies]);

  const selectCompany = useCallback(
    async (companyId: string | null) => {
      if (!companyId || !workspaceId) {
        setSelectedCompany(null);
        return;
      }

      setError(null);

      try {
        const company = await fetchCompanyById(companyId, workspaceId);
        setSelectedCompany(company);
      } catch (selectError) {
        setError(getErrorMessage(selectError));
        setSelectedCompany(null);
      }
    },
    [workspaceId],
  );

  const createCompany = useCallback(
    async (input: CompanyCreateInput) => {
      if (!workspaceId || !userId) {
        throw new Error("Workspace oder Benutzer fehlt.");
      }

      setError(null);
      const company = await createCompanyRequest(input, workspaceId, userId);
      await refreshCompanies();
      setSelectedCompany(company);
      return company;
    },
    [refreshCompanies, userId, workspaceId],
  );

  const updateCompany = useCallback(
    async (companyId: string, input: CompanyUpdateInput) => {
      if (!workspaceId) {
        throw new Error("Workspace fehlt.");
      }

      setError(null);
      const company = await updateCompanyRequest(companyId, input, workspaceId);
      await refreshCompanies();
      setSelectedCompany(company);
      return company;
    },
    [refreshCompanies, workspaceId],
  );

  const archiveCompany = useCallback(
    async (companyId: string) => {
      if (!workspaceId) {
        throw new Error("Workspace fehlt.");
      }

      setError(null);
      await archiveCompanyRequest(companyId, workspaceId);
      setSelectedCompany(null);
      await refreshCompanies();
    },
    [refreshCompanies, workspaceId],
  );

  return {
    companies,
    selectedCompany,
    isLoading,
    error,
    refreshCompanies,
    selectCompany,
    createCompany,
    updateCompany,
    archiveCompany,
  };
}
