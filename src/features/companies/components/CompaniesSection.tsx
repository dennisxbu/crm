// PHASE 3 COMPANY CORE — minimal functional UI, not final CRM design.
import { useAuth } from "../../../app/providers/AuthProvider";
import { useWorkspace } from "../../../app/providers/WorkspaceProvider";
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

  if (!activeWorkspace || !user) {
    return null;
  }

  return (
    <section className="panel" aria-labelledby="companies-heading">
      <h2 id="companies-heading">Companies — Phase 3 Core</h2>
      <p className="shell__notice">
        Company-first: Unternehmen ohne Kontakt und ohne Deal anlegbar. Keine
        Custom Fields, keine Pipelines, keine Views in dieser Phase.
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
