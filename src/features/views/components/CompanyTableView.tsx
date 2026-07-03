import type { Company } from "../../companies/company.types";
import type {
  CustomField,
  CustomFieldOption,
  CustomFieldValue,
} from "../../custom-fields/custom-field.types";
import { getCellDisplayValue } from "../view-engine";
import type {
  ResolvedTableField,
  TableSortState,
  View,
  ViewColumnConfig,
} from "../view.types";
import { CompanyTableCell } from "./CompanyTableCell";

type CompanyTableViewProps = {
  view: View | null;
  viewLoading: boolean;
  viewError: string | null;
  companies: Company[];
  companiesLoading: boolean;
  companiesError: string | null;
  visibleColumns: ViewColumnConfig[];
  resolvedFields: ResolvedTableField[];
  displayCompanies: Company[];
  customFields: CustomField[];
  customFieldOptions: CustomFieldOption[];
  valuesByCompanyId: Map<string, Map<string, CustomFieldValue>>;
  valuesLoading: boolean;
  valuesError: string | null;
  activeSort: TableSortState | null;
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
  onSortChange: (sort: TableSortState) => void;
};

export function CompanyTableView({
  view,
  viewLoading,
  viewError,
  companies,
  companiesLoading,
  companiesError,
  visibleColumns,
  resolvedFields,
  displayCompanies,
  customFields,
  customFieldOptions,
  valuesByCompanyId,
  valuesLoading,
  valuesError,
  activeSort,
  selectedCompanyId,
  onSelectCompany,
  onSortChange,
}: CompanyTableViewProps) {
  const fieldByRef = new Map(
    resolvedFields.map((field) => [field.fieldRef, field]),
  );
  const customFieldById = new Map(
    customFields.map((field) => [field.id, field]),
  );

  if (viewLoading || companiesLoading || valuesLoading) {
    return <p className="shell__notice">Tabellenansicht wird geladen…</p>;
  }

  if (viewError) {
    return <p className="shell__error">{viewError}</p>;
  }

  if (companiesError) {
    return <p className="shell__error">{companiesError}</p>;
  }

  if (valuesError) {
    return <p className="shell__error">{valuesError}</p>;
  }

  if (!view) {
    return (
      <p className="shell__error">
        Keine Tabellenansicht konfiguriert. Standardansicht konnte nicht geladen
        werden.
      </p>
    );
  }

  if (visibleColumns.length === 0) {
    return (
      <p className="shell__notice">
        Die Tabellenansicht „{view.name}" hat keine sichtbaren Spalten.
      </p>
    );
  }

  if (companies.length === 0) {
    return (
      <p className="shell__notice">
        Noch keine aktiven Unternehmen. Lege das erste mit nur einem Namen an.
      </p>
    );
  }

  const handleHeaderClick = (fieldRef: ResolvedTableField["fieldRef"]) => {
    const field = fieldByRef.get(fieldRef);
    if (!field?.sortable) {
      return;
    }

    const nextSort: TableSortState =
      activeSort?.field_ref === fieldRef && activeSort.direction === "asc"
        ? { field_ref: fieldRef, direction: "desc" }
        : { field_ref: fieldRef, direction: "asc" };

    onSortChange(nextSort);
  };

  return (
    <div className="company-table">
      <div className="company-table__meta">
        <p className="shell__notice">
          Ansicht: <strong>{view.name}</strong> — Spalten aus Datenbank-Config (
          {visibleColumns.length})
        </p>
      </div>

      <div className="company-table__scroll">
        <table className="company-table__table">
          <thead>
            <tr>
              {visibleColumns.map((column) => {
                const field = fieldByRef.get(column.field_ref);
                const isSorted = activeSort?.field_ref === column.field_ref;
                const sortIndicator = isSorted
                  ? activeSort?.direction === "asc"
                    ? " ↑"
                    : " ↓"
                  : "";

                return (
                  <th
                    key={column.field_ref}
                    style={{ minWidth: column.width }}
                    className={
                      field?.sortable ? "company-table__header--sortable" : ""
                    }
                  >
                    {field?.sortable ? (
                      <button
                        type="button"
                        className="company-table__header-button"
                        onClick={() => handleHeaderClick(column.field_ref)}
                      >
                        {field?.label ?? column.field_ref}
                        {sortIndicator}
                      </button>
                    ) : (
                      (field?.label ?? column.field_ref)
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayCompanies.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length}>
                  <p className="shell__notice">
                    Keine Unternehmen entsprechen den aktiven Filtern.
                  </p>
                </td>
              </tr>
            ) : (
              displayCompanies.map((company) => (
                <tr
                  key={company.id}
                  className={
                    selectedCompanyId === company.id
                      ? "company-table__row--active"
                      : ""
                  }
                >
                  {visibleColumns.map((column) => {
                    const field = fieldByRef.get(column.field_ref);
                    if (!field) {
                      return (
                        <td key={column.field_ref}>
                          <span className="company-table__missing">
                            Ungültige Spalte
                          </span>
                        </td>
                      );
                    }

                    const displayValue = getCellDisplayValue(
                      company,
                      field,
                      customFields,
                      customFieldOptions,
                      valuesByCompanyId,
                    );

                    const customField =
                      field.customFieldId !== undefined
                        ? customFieldById.get(field.customFieldId)
                        : undefined;

                    const isNameColumn =
                      field.source === "system" && field.systemKey === "name";

                    return (
                      <td key={column.field_ref}>
                        {isNameColumn ? (
                          <button
                            type="button"
                            className="company-table__name-button"
                            onClick={() => onSelectCompany(company.id)}
                          >
                            <CompanyTableCell
                              field={field}
                              displayValue={displayValue}
                              customField={customField}
                              customFieldOptions={customFieldOptions}
                            />
                          </button>
                        ) : (
                          <CompanyTableCell
                            field={field}
                            displayValue={displayValue}
                            customField={customField}
                            customFieldOptions={customFieldOptions}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
