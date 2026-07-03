import { useState } from "react";
import { FIELD_TYPE_LABELS } from "../custom-field.constants";
import type {
  CustomField,
  CustomFieldCreateInput,
  CustomFieldOption,
  CustomFieldUpdateInput,
} from "../custom-field.types";
import { CustomFieldForm } from "./CustomFieldForm";
import { CustomFieldOptionsEditor } from "./CustomFieldOptionsEditor";

type CustomFieldSettingsProps = {
  fields: CustomField[];
  getOptionsForField: (fieldId: string) => CustomFieldOption[];
  isLoading: boolean;
  error: string | null;
  onEnsureDefaults: () => Promise<void>;
  onCreateField: (input: CustomFieldCreateInput) => Promise<void>;
  onUpdateField: (
    fieldId: string,
    input: CustomFieldUpdateInput,
  ) => Promise<void>;
  onArchiveField: (fieldId: string) => Promise<void>;
  onAddOption: (fieldId: string, label: string, value: string) => Promise<void>;
  onRenameOption: (optionId: string, label: string) => Promise<void>;
  onArchiveOption: (optionId: string) => Promise<void>;
};

export function CustomFieldSettings({
  fields,
  getOptionsForField,
  isLoading,
  error,
  onEnsureDefaults,
  onCreateField,
  onUpdateField,
  onArchiveField,
  onAddOption,
  onRenameOption,
  onArchiveOption,
}: CustomFieldSettingsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [optionsFieldId, setOptionsFieldId] = useState<string | null>(null);
  const [isEnsuring, setIsEnsuring] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const editingField = fields.find((field) => field.id === editingFieldId);
  const optionsField = fields.find((field) => field.id === optionsFieldId);

  return (
    <section className="panel" aria-labelledby="custom-fields-settings-heading">
      <h2 id="custom-fields-settings-heading">Custom Fields — Einstellungen</h2>
      <p className="shell__notice">
        Metadata-driven Felddefinitionen für Unternehmen. Keine hardcoded
        Spalten — alles aus der Datenbank.
      </p>

      {error ? <p className="shell__error">{error}</p> : null}
      {actionError ? <p className="auth-form__error">{actionError}</p> : null}

      <div className="company-form__actions">
        <button
          type="button"
          className="auth-form__submit"
          disabled={isEnsuring}
          onClick={() => {
            setActionError(null);
            setIsEnsuring(true);
            void onEnsureDefaults()
              .catch((ensureError) => {
                setActionError(
                  ensureError instanceof Error
                    ? ensureError.message
                    : "Default-Felder konnten nicht angelegt werden.",
                );
              })
              .finally(() => setIsEnsuring(false));
          }}
        >
          {isEnsuring ? "Stellt sicher…" : "Default-Felder sicherstellen"}
        </button>
        <button
          type="button"
          className="company-form__secondary"
          onClick={() => {
            setShowCreateForm(true);
            setEditingFieldId(null);
          }}
        >
          Neues Feld
        </button>
      </div>

      {showCreateForm ? (
        <CustomFieldForm
          mode="create"
          onSubmit={async (input) => {
            await onCreateField(input as CustomFieldCreateInput);
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}

      {editingField ? (
        <CustomFieldForm
          mode="edit"
          initialField={editingField}
          onSubmit={async (input) => {
            await onUpdateField(editingField.id, input);
            setEditingFieldId(null);
          }}
          onCancel={() => setEditingFieldId(null)}
        />
      ) : null}

      {optionsField ? (
        <CustomFieldOptionsEditor
          field={optionsField}
          options={getOptionsForField(optionsField.id)}
          onAddOption={async (label, value) => {
            await onAddOption(optionsField.id, label, value);
          }}
          onRenameOption={onRenameOption}
          onArchiveOption={onArchiveOption}
        />
      ) : null}

      <h3 className="companies-layout__subheading">Company Custom Fields</h3>

      {isLoading ? (
        <p className="shell__notice">Felder werden geladen…</p>
      ) : null}

      <ul className="company-list">
        {fields.map((field) => (
          <li key={field.id} className="custom-field-settings__item">
            <div>
              <strong>{field.name}</strong>
              <p className="company-list__meta">
                {FIELD_TYPE_LABELS[field.field_type]} · Key{" "}
                <code>{field.key}</code>
                {field.is_required ? " · Pflicht" : ""}
                {field.is_system ? " · System" : ""}
              </p>
            </div>
            <div className="company-form__actions">
              <button
                type="button"
                className="company-form__secondary"
                onClick={() => {
                  setEditingFieldId(field.id);
                  setShowCreateForm(false);
                  setOptionsFieldId(null);
                }}
              >
                Bearbeiten
              </button>
              {(field.field_type === "select" ||
                field.field_type === "multi_select") && (
                <button
                  type="button"
                  className="company-form__secondary"
                  onClick={() => setOptionsFieldId(field.id)}
                >
                  Optionen
                </button>
              )}
              <button
                type="button"
                className="company-form__secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      `Feld „${field.name}" archivieren? Bestehende Werte bleiben erhalten.`,
                    )
                  ) {
                    void onArchiveField(field.id);
                  }
                }}
              >
                Archivieren
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
