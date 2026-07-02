import type { Company } from "../company.types";
import {
  CONTACT_DISCOVERY_STATUS_LABELS,
  LIFECYCLE_STATUS_LABELS,
} from "../company.constants";

type CompanyListProps = {
  companies: Company[];
  selectedCompanyId: string | null;
  isLoading: boolean;
  onSelect: (companyId: string) => void;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("de-DE");
}

export function CompanyList({
  companies,
  selectedCompanyId,
  isLoading,
  onSelect,
}: CompanyListProps) {
  if (isLoading) {
    return <p className="shell__notice">Unternehmen werden geladen…</p>;
  }

  if (companies.length === 0) {
    return (
      <p className="shell__notice">
        Noch keine aktiven Unternehmen. Lege das erste mit nur einem Namen an.
      </p>
    );
  }

  return (
    <ul className="company-list">
      {companies.map((company) => (
        <li key={company.id}>
          <button
            type="button"
            className={`company-list__item${
              selectedCompanyId === company.id
                ? " company-list__item--active"
                : ""
            }`}
            onClick={() => onSelect(company.id)}
          >
            <span className="company-list__name">{company.name}</span>
            <span className="company-list__meta">
              {
                CONTACT_DISCOVERY_STATUS_LABELS[
                  company.contact_discovery_status
                ]
              }
              {" · "}
              {LIFECYCLE_STATUS_LABELS[company.lifecycle_status]}
            </span>
            <span className="company-list__meta">
              Erstellt: {formatDate(company.created_at)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
