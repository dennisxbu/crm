import { useState } from "react";
import { slugifyFieldKey } from "../custom-field.constants";
import type { CustomField, CustomFieldOption } from "../custom-field.types";

type CustomFieldOptionsEditorProps = {
  field: CustomField;
  options: CustomFieldOption[];
  onAddOption: (label: string, value: string) => Promise<void>;
  onRenameOption: (optionId: string, label: string) => Promise<void>;
  onArchiveOption: (optionId: string) => Promise<void>;
};

export function CustomFieldOptionsEditor({
  field,
  options,
  onAddOption,
  onRenameOption,
  onArchiveOption,
}: CustomFieldOptionsEditorProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [valueTouched, setValueTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeOptions = options
    .filter((option) => !option.is_archived)
    .sort((left, right) => left.order_index - right.order_index);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const label = newLabel.trim();
      const value = (
        valueTouched ? newValue : slugifyFieldKey(newLabel)
      ).trim();

      if (!label || !value) {
        throw new Error("Label und Wert sind erforderlich.");
      }

      await onAddOption(label, value);
      setNewLabel("");
      setNewValue("");
      setValueTouched(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Option konnte nicht angelegt werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (field.field_type !== "select" && field.field_type !== "multi_select") {
    return null;
  }

  return (
    <div className="custom-field-options">
      <h4 className="companies-layout__subheading">Optionen — {field.name}</h4>

      <ul className="company-list">
        {activeOptions.map((option) => (
          <li key={option.id} className="custom-field-options__item">
            <label className="auth-form__field">
              Label
              <input
                defaultValue={option.label}
                onBlur={(event) => {
                  const nextLabel = event.target.value.trim();
                  if (nextLabel && nextLabel !== option.label) {
                    void onRenameOption(option.id, nextLabel);
                  }
                }}
              />
            </label>
            <p className="company-list__meta">
              Wert: <code>{option.value}</code>
            </p>
            <button
              type="button"
              className="company-form__secondary"
              onClick={() => void onArchiveOption(option.id)}
            >
              Archivieren
            </button>
          </li>
        ))}
      </ul>

      <form
        className="company-form"
        onSubmit={(event) => void handleAdd(event)}
      >
        <label className="auth-form__field">
          Neue Option
          <input
            value={newLabel}
            onChange={(event) => {
              setNewLabel(event.target.value);
              if (!valueTouched) {
                setNewValue(slugifyFieldKey(event.target.value));
              }
            }}
            required
          />
        </label>

        <label className="auth-form__field">
          Stabiler Wert
          <input
            value={newValue}
            onChange={(event) => {
              setValueTouched(true);
              setNewValue(event.target.value);
            }}
            required
            pattern="^[a-z][a-z0-9_]*$"
          />
        </label>

        {error ? <p className="auth-form__error">{error}</p> : null}

        <button
          type="submit"
          className="auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Legt an…" : "Option hinzufügen"}
        </button>
      </form>
    </div>
  );
}
