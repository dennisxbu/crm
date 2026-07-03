import { useEffect } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useWorkspace } from "../../../app/providers/WorkspaceProvider";
import { ensureDefaultCompanyCustomFields } from "../../custom-fields/api/customFields";
import { useCustomFields } from "../../custom-fields/hooks/useCustomFields";
import { useCustomFieldValues } from "../../custom-fields/hooks/useCustomFieldValues";
import { useCompanies } from "../hooks/useCompanies";
import { CompanyDetail } from "./CompanyDetail";
import { CompanyForm } from "./CompanyForm";
import { CompanyList } from "./CompanyList";

export function CompaniesSection() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const {
    companies,
    selectedCompany,
    isLoading,
    error,
    selectCompany,
    createCompany,
    updateCompany,
    archiveCompany,
  } = useCompanies(activeWorkspace?.id, user?.id);

  const { fields: customFields, isLoading: customFieldsLoading } =
    useCustomFields(activeWorkspace?.id);

  const {
    optionsByFieldId,
    getDisplayValue,
    saveFieldValue,
    isLoading: valuesLoading,
    isSaving: valuesSaving,
    error: valuesError,
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
      // Settings UI offers manual retry via ensureDefaults
    });
  }, [activeWorkspace?.id]);

  if (!activeWorkspace || !user) {
    return null;
  }

  return (
    <section className="panel" aria-labelledby="companies-heading">
      <h2 id="companies-heading">Companies — Phase 4 Core</h2>
      <p className="shell__notice">
        Company-first: Unternehmen ohne Kontakt und ohne Deal anlegbar. Custom
        Fields im Detail — keine Table View, keine Pipelines in Phase 4.
      </p>

      {error ? <p className="shell__error">{error}</p> : null}

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

        <div className="companies-layout__column">
          <h3 className="companies-layout__subheading">Aktive Unternehmen</h3>
          <CompanyList
            companies={companies}
            selectedCompanyId={selectedCompany?.id ?? null}
            isLoading={isLoading}
            onSelect={(companyId) => void selectCompany(companyId)}
          />
        </div>
      </div>

      {selectedCompany ? (
        <CompanyDetail
          company={selectedCompany}
          customFields={customFields}
          customFieldsLoading={customFieldsLoading || valuesLoading}
          customFieldsSaving={valuesSaving}
          customFieldsError={valuesError}
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
