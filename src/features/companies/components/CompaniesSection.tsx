import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useWorkspace } from "../../../app/providers/WorkspaceProvider";
import { ensureDefaultCompanyCustomFields } from "../../custom-fields/api/customFields";
import { useCustomFields } from "../../custom-fields/hooks/useCustomFields";
import { useCustomFieldValues } from "../../custom-fields/hooks/useCustomFieldValues";
import { ensureDefaultCompanyTableView } from "../../views/api/views";
import { CompanyTableView } from "../../views/components/CompanyTableView";
import { useCompanyTableRows } from "../../views/hooks/useCompanyTableRows";
import { useCompanyTableView } from "../../views/hooks/useCompanyTableView";
import type { TableSortState } from "../../views/view.types";
import { getPrimarySort } from "../../views/view.utils";
import { useCompanies } from "../hooks/useCompanies";
import { CompanyDetail } from "./CompanyDetail";
import { CompanyForm } from "./CompanyForm";

export function CompaniesSection() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const {
    companies,
    selectedCompany,
    isLoading: companiesLoading,
    error: companiesError,
    selectCompany,
    createCompany,
    updateCompany,
    archiveCompany,
  } = useCompanies(activeWorkspace?.id, user?.id);

  const {
    view,
    isLoading: viewLoading,
    error: viewError,
  } = useCompanyTableView(activeWorkspace?.id);

  const { fields: customFields, isLoading: customFieldsLoading } =
    useCustomFields(activeWorkspace?.id);

  const [activeSort, setActiveSort] = useState<TableSortState | null>(null);

  useEffect(() => {
    if (!view) {
      setActiveSort(null);
      return;
    }

    setActiveSort(getPrimarySort(view.config));
  }, [view]);

  const {
    visibleColumns,
    resolvedFields,
    displayCompanies,
    valuesByCompanyId,
    customFieldOptions,
    isLoadingValues,
    valuesError,
  } = useCompanyTableRows(companies, view, customFields, activeSort);

  const {
    optionsByFieldId,
    getDisplayValue,
    saveFieldValue,
    isLoading: valuesLoading,
    isSaving: valuesSaving,
    error: detailValuesError,
  } = useCustomFieldValues(
    activeWorkspace?.id,
    selectedCompany?.id,
    customFields,
  );

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    void ensureDefaultCompanyCustomFields(activeWorkspace.id).catch(() => {
      // Settings UI offers manual retry
    });
    void ensureDefaultCompanyTableView(activeWorkspace.id).catch(() => {
      // Table view hook retries via loadCompanyTableView
    });
  }, [activeWorkspace?.id]);

  if (!activeWorkspace || !user) {
    return null;
  }

  return (
    <section className="panel" aria-labelledby="companies-heading">
      <h2 id="companies-heading">Companies — Phase 5 Table View</h2>
      <p className="shell__notice">
        Company-first: Unternehmen ohne Kontakt und ohne Deal. Tabellen-Spalten
        aus <code>views.config</code> — keine hardcoded JSX-Spalten.
      </p>

      {companiesError ? <p className="shell__error">{companiesError}</p> : null}

      <div className="companies-layout">
        <div className="companies-layout__column">
          <h3 className="companies-layout__subheading">
            Unternehmen hinzufügen
          </h3>
          <CompanyForm
            mode="create"
            onSubmit={async (input) => {
              await createCompany(input);
            }}
          />
        </div>

        <div className="companies-layout__column companies-layout__column--wide">
          <h3 className="companies-layout__subheading">Aktive Unternehmen</h3>
          <CompanyTableView
            view={view}
            viewLoading={viewLoading || customFieldsLoading}
            viewError={viewError}
            companies={companies}
            companiesLoading={companiesLoading}
            companiesError={companiesError}
            visibleColumns={visibleColumns}
            resolvedFields={resolvedFields}
            displayCompanies={displayCompanies}
            customFields={customFields}
            customFieldOptions={customFieldOptions}
            valuesByCompanyId={valuesByCompanyId}
            valuesLoading={isLoadingValues}
            valuesError={valuesError}
            activeSort={activeSort}
            selectedCompanyId={selectedCompany?.id ?? null}
            onSelectCompany={(companyId) => void selectCompany(companyId)}
            onSortChange={setActiveSort}
          />
        </div>
      </div>

      {selectedCompany ? (
        <CompanyDetail
          company={selectedCompany}
          customFields={customFields}
          customFieldsLoading={customFieldsLoading || valuesLoading}
          customFieldsSaving={valuesSaving}
          customFieldsError={detailValuesError}
          optionsByFieldId={optionsByFieldId}
          getCustomFieldDisplayValue={getDisplayValue}
          onSaveCustomFieldValue={saveFieldValue}
          onUpdate={async (input) => {
            await updateCompany(selectedCompany.id, input);
          }}
          onArchive={async () => {
            await archiveCompany(selectedCompany.id);
          }}
          onClose={() => void selectCompany(null)}
        />
      ) : null}
    </section>
  );
}
