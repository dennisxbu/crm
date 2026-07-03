import { useState } from "react";
import { CustomFieldValueList } from "../../custom-fields/components/CustomFieldValueList";
import type {
  CustomField,
  CustomFieldOption,
} from "../../custom-fields/custom-field.types";
import {
  CONTACT_DISCOVERY_STATUS_LABELS,
  LIFECYCLE_STATUS_LABELS,
} from "../company.constants";
import type { Company, CompanyUpdateInput } from "../company.types";
import { CompanyForm } from "./CompanyForm";

type CompanyDetailProps = {
  company: Company;
  customFields: CustomField[];
  customFieldsLoading: boolean;
  customFieldsSaving: boolean;
  customFieldsError: string | null;
  optionsByFieldId: Map<string, CustomFieldOption[]>;
  getCustomFieldDisplayValue: (field: CustomField) => unknown;
  onSaveCustomFieldValue: (
    field: CustomField,
    rawValue: unknown,
  ) => Promise<void>;
  onUpdate: (input: CompanyUpdateInput) => Promise<void>;
  onArchive: () => Promise<void>;
  onClose: () => void;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("de-DE");
}

export function CompanyDetail({
  company,
  customFields,
  customFieldsLoading,
  customFieldsSaving,
  customFieldsError,
  optionsByFieldId,
  getCustomFieldDisplayValue,
  onSaveCustomFieldValue,
  onUpdate,
  onArchive,
  onClose,
}: CompanyDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleArchive = async () => {
    setActionError(null);
    setIsArchiving(true);

    try {
      await onArchive();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Archivieren fehlgeschlagen.",
      );
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="company-detail-heading">
      <div className="company-detail__header">
        <h2 id="company-detail-heading">{company.name}</h2>
        <button
          type="button"
          className="company-form__secondary"
          onClick={onClose}
        >
          Schließen
        </button>
      </div>

      {isEditing ? (
        <CompanyForm
          mode="edit"
          initialCompany={company}
          onSubmit={async (input) => {
            await onUpdate(input);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <dl className="status-list">
            <div className="status-list__row">
              <dt>Website</dt>
              <dd>{company.website ?? "—"}</dd>
            </div>
            <div className="status-list__row">
              <dt>Kontakt-Recherche</dt>
              <dd>
                {
                  CONTACT_DISCOVERY_STATUS_LABELS[
                    company.contact_discovery_status
                  ]
                }
              </dd>
            </div>
            <div className="status-list__row">
              <dt>Lifecycle</dt>
              <dd>{LIFECYCLE_STATUS_LABELS[company.lifecycle_status]}</dd>
            </div>
            <div className="status-list__row">
              <dt>Stadt</dt>
              <dd>{company.city ?? "—"}</dd>
            </div>
            <div className="status-list__row">
              <dt>Land</dt>
              <dd>{company.country ?? "—"}</dd>
            </div>
            <div className="status-list__row">
              <dt>Notizen</dt>
              <dd>{company.notes_summary ?? "—"}</dd>
            </div>
            <div className="status-list__row">
              <dt>Erstellt</dt>
              <dd>{formatDate(company.created_at)}</dd>
            </div>
            <div className="status-list__row">
              <dt>Aktualisiert</dt>
              <dd>{formatDate(company.updated_at)}</dd>
            </div>
            <div className="status-list__row">
              <dt>Archiviert</dt>
              <dd>{formatDate(company.archived_at)}</dd>
            </div>
          </dl>

          <CustomFieldValueList
            fields={customFields}
            optionsByFieldId={optionsByFieldId}
            getDisplayValue={getCustomFieldDisplayValue}
            onSaveFieldValue={onSaveCustomFieldValue}
            isLoading={customFieldsLoading}
            isSaving={customFieldsSaving}
            error={customFieldsError}
          />

          {actionError ? (
            <p className="auth-form__error">{actionError}</p>
          ) : null}

          <div className="company-form__actions">
            <button
              type="button"
              className="auth-form__submit"
              onClick={() => setIsEditing(true)}
            >
              Bearbeiten
            </button>
            <button
              type="button"
              className="company-form__secondary"
              disabled={isArchiving}
              onClick={() => void handleArchive()}
            >
              {isArchiving ? "Archiviert…" : "Archivieren"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
