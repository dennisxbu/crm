import { useState } from "react";
import type { CustomField, CustomFieldOption } from "../custom-field.types";
import { FIELD_TYPE_LABELS } from "../custom-field.constants";
import { getFieldTypeHandler } from "../field-registry/fieldTypeRegistry";
import { isMvpFieldType } from "../field-registry/fieldTypeRegistry";

type CustomFieldValueListProps = {
  fields: CustomField[];
  optionsByFieldId: Map<string, CustomFieldOption[]>;
  getDisplayValue: (field: CustomField) => unknown;
  onSaveFieldValue: (field: CustomField, rawValue: unknown) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

export function CustomFieldValueList({
  fields,
  optionsByFieldId,
  getDisplayValue,
  onSaveFieldValue,
  isLoading,
  isSaving,
  error,
}: CustomFieldValueListProps) {
  const visibleFields = fields.filter(
    (field) => !field.is_hidden && !field.is_archived,
  );

  if (isLoading) {
    return <p className="shell__notice">Eigene Felder werden geladen…</p>;
  }

  if (visibleFields.length === 0) {
    return (
      <p className="shell__notice">
        Keine Custom Fields definiert. Lege Felder unter Einstellungen an oder
        stelle Default-Felder sicher.
      </p>
    );
  }

  return (
    <div className="custom-field-values">
      <h3 className="companies-layout__subheading">Eigene Felder</h3>
      {error ? <p className="auth-form__error">{error}</p> : null}

      <dl className="status-list">
        {visibleFields.map((field) => (
          <CustomFieldValueRow
            key={field.id}
            field={field}
            options={optionsByFieldId.get(field.id) ?? []}
            displayValue={getDisplayValue(field)}
            onSave={onSaveFieldValue}
            disabled={isSaving}
          />
        ))}
      </dl>
    </div>
  );
}

type CustomFieldValueRowProps = {
  field: CustomField;
  options: CustomFieldOption[];
  displayValue: unknown;
  onSave: (field: CustomField, rawValue: unknown) => Promise<void>;
  disabled: boolean;
};

function CustomFieldValueRow({
  field,
  options,
  displayValue,
  onSave,
  disabled,
}: CustomFieldValueRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState<unknown>(displayValue);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSavingRow, setIsSavingRow] = useState(false);

  const handler = getFieldTypeHandler(field.field_type);
  const mvpSupported = isMvpFieldType(field.field_type);

  const handleSave = async () => {
    setFieldError(null);
    setIsSavingRow(true);

    try {
      const normalized = handler.normalizeInput(draftValue, field, options);
      const validation = handler.validate(normalized, field, options);

      if (!validation.valid) {
        setFieldError(validation.message ?? "Ungültiger Wert.");
        return;
      }

      await onSave(field, draftValue);
      setIsEditing(false);
    } catch (saveError) {
      setFieldError(
        saveError instanceof Error
          ? saveError.message
          : "Speichern fehlgeschlagen.",
      );
    } finally {
      setIsSavingRow(false);
    }
  };

  return (
    <div className="status-list__row custom-field-value-row">
      <dt>
        {field.name}
        {field.is_required ? " *" : ""}
        <span className="company-list__meta">
          {FIELD_TYPE_LABELS[field.field_type]}
        </span>
      </dt>
      <dd>
        {field.help_text ? (
          <p className="company-list__meta">{field.help_text}</p>
        ) : null}

        {isEditing && mvpSupported ? (
          <div className="custom-field-value-row__edit">
            {handler.renderEdit({
              field,
              options,
              value: draftValue,
              onChange: setDraftValue,
              disabled: disabled || isSavingRow,
              error: fieldError,
            })}
            {fieldError ? (
              <p className="auth-form__error">{fieldError}</p>
            ) : null}
            <div className="company-form__actions">
              <button
                type="button"
                className="auth-form__submit"
                disabled={disabled || isSavingRow}
                onClick={() => void handleSave()}
              >
                {isSavingRow ? "Speichert…" : "Speichern"}
              </button>
              <button
                type="button"
                className="company-form__secondary"
                onClick={() => {
                  setDraftValue(displayValue);
                  setFieldError(null);
                  setIsEditing(false);
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <div className="custom-field-value-row__display">
            {handler.renderDisplay({
              field,
              options,
              value: displayValue,
              onChange: () => undefined,
            })}
            {mvpSupported ? (
              <button
                type="button"
                className="company-form__secondary"
                onClick={() => {
                  setDraftValue(displayValue);
                  setIsEditing(true);
                }}
              >
                Bearbeiten
              </button>
            ) : (
              <span className="shell__notice">
                UI für diesen Typ folgt später
              </span>
            )}
          </div>
        )}
      </dd>
    </div>
  );
}
