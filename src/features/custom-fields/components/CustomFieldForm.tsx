import { useEffect, useState } from "react";
import {
  ALL_FIELD_TYPES,
  FIELD_TYPE_LABELS,
  MVP_FIELD_TYPES,
  slugifyFieldKey,
} from "../custom-field.constants";
import type {
  CustomField,
  CustomFieldCreateInput,
  CustomFieldUpdateInput,
  FieldType,
} from "../custom-field.types";
import { isMvpFieldType } from "../field-registry/fieldTypeRegistry";

type CustomFieldFormProps = {
  mode: "create" | "edit";
  initialField?: CustomField;
  onSubmit: (
    input: CustomFieldCreateInput | CustomFieldUpdateInput,
  ) => Promise<void>;
  onCancel: () => void;
};

export function CustomFieldForm({
  mode,
  initialField,
  onSubmit,
  onCancel,
}: CustomFieldFormProps) {
  const [name, setName] = useState(initialField?.name ?? "");
  const [key, setKey] = useState(initialField?.key ?? "");
  const [keyTouched, setKeyTouched] = useState(mode === "edit");
  const [fieldType, setFieldType] = useState<FieldType>(
    initialField?.field_type ?? "text",
  );
  const [description, setDescription] = useState(
    initialField?.description ?? "",
  );
  const [placeholder, setPlaceholder] = useState(
    initialField?.placeholder ?? "",
  );
  const [helpText, setHelpText] = useState(initialField?.help_text ?? "");
  const [isRequired, setIsRequired] = useState(
    initialField?.is_required ?? false,
  );
  const [orderIndex, setOrderIndex] = useState(
    initialField?.order_index?.toString() ?? "0",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "create" && !keyTouched) {
      setKey(slugifyFieldKey(name));
    }
  }, [name, mode, keyTouched]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await onSubmit({
          name,
          key,
          field_type: fieldType,
          description: description || null,
          placeholder: placeholder || null,
          help_text: helpText || null,
          is_required: isRequired,
          order_index: Number(orderIndex) || 0,
        });
      } else {
        await onSubmit({
          name,
          field_type: fieldType,
          description: description || null,
          placeholder: placeholder || null,
          help_text: helpText || null,
          is_required: isRequired,
          order_index: Number(orderIndex) || 0,
        });
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Speichern fehlgeschlagen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="company-form"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <label className="auth-form__field">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>

      {mode === "create" ? (
        <label className="auth-form__field">
          Schlüssel
          <input
            value={key}
            onChange={(event) => {
              setKeyTouched(true);
              setKey(event.target.value);
            }}
            required
            pattern="^[a-z][a-z0-9_]*$"
          />
        </label>
      ) : (
        <p className="shell__notice">
          Schlüssel: <code>{initialField?.key}</code>
        </p>
      )}

      <label className="auth-form__field">
        Feldtyp
        <select
          value={fieldType}
          onChange={(event) => setFieldType(event.target.value as FieldType)}
          disabled={mode === "edit"}
        >
          {ALL_FIELD_TYPES.map((type) => (
            <option key={type} value={type}>
              {FIELD_TYPE_LABELS[type]}
              {!isMvpFieldType(type) ? " (später)" : ""}
            </option>
          ))}
        </select>
      </label>

      {!MVP_FIELD_TYPES.includes(fieldType) && mode === "create" ? (
        <p className="shell__notice">
          Dieser Feldtyp ist in Phase 4 noch nicht vollständig in der UI
          verfügbar.
        </p>
      ) : null}

      <label className="auth-form__field">
        Beschreibung
        <textarea
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        Platzhalter
        <input
          value={placeholder}
          onChange={(event) => setPlaceholder(event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        Hilfetext
        <input
          value={helpText}
          onChange={(event) => setHelpText(event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        Sortierung
        <input
          type="number"
          value={orderIndex}
          onChange={(event) => setOrderIndex(event.target.value)}
        />
      </label>

      <label className="custom-field-boolean">
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(event) => setIsRequired(event.target.checked)}
        />
        <span>Pflichtfeld</span>
      </label>

      {error ? <p className="auth-form__error">{error}</p> : null}

      <div className="company-form__actions">
        <button
          type="submit"
          className="auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Speichert…"
            : mode === "create"
              ? "Feld anlegen"
              : "Speichern"}
        </button>
        <button
          type="button"
          className="company-form__secondary"
          onClick={onCancel}
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
