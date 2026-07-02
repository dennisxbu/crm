import type { ReactNode } from "react";
import type {
  CustomField,
  CustomFieldOption,
  FieldType,
  NormalizedFieldValue,
  StorageColumn,
  ValidationResult,
} from "../custom-field.types";
import { getValidationNumber, getOptionLabel } from "./fieldValueUtils";
import {
  normalizeUrl,
  validateEmailFormat,
  validateNumberRange,
  validatePhoneDigits,
  validateRequired,
  validateTextLength,
  validateUrlFormat,
} from "./fieldTypeValidation";

export type FieldHandlerContext = {
  field: CustomField;
  options: CustomFieldOption[];
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string | null;
};

export type FieldTypeHandler = {
  fieldType: FieldType;
  storageColumn: StorageColumn;
  normalizeInput: (
    raw: unknown,
    field: CustomField,
    options: CustomFieldOption[],
  ) => NormalizedFieldValue;
  validate: (
    value: NormalizedFieldValue,
    field: CustomField,
    options: CustomFieldOption[],
  ) => ValidationResult;
  renderDisplay: (context: FieldHandlerContext) => ReactNode;
  renderEdit: (context: FieldHandlerContext) => ReactNode;
  getEmptyDisplay: () => ReactNode;
};

function emptyValue(storageColumn: StorageColumn): NormalizedFieldValue {
  return {
    storageColumn,
    value_text: null,
    value_number: null,
    value_boolean: null,
    value_date: null,
    value_datetime: null,
    value_json: null,
    isEmpty: true,
  };
}

function textHandler(maxLengthDefault: number): FieldTypeHandler {
  return {
    fieldType: "text",
    storageColumn: "value_text",
    normalizeInput(raw) {
      if (raw === null || raw === undefined || raw === "") {
        return emptyValue("value_text");
      }

      const value = String(raw).trim();
      if (!value) {
        return emptyValue("value_text");
      }

      return {
        storageColumn: "value_text",
        value_text: value,
        value_number: null,
        value_boolean: null,
        value_date: null,
        value_datetime: null,
        value_json: null,
        isEmpty: false,
      };
    },
    validate(value, field) {
      const required = validateRequired(value.isEmpty, field);
      if (!required.valid) {
        return required;
      }

      if (value.isEmpty || value.value_text === null) {
        return { valid: true };
      }

      return validateTextLength(value.value_text, field, maxLengthDefault);
    },
    renderDisplay({ value }) {
      if (value === null || value === undefined || value === "") {
        return "—";
      }
      return String(value);
    },
    renderEdit({ value, onChange, disabled, error }) {
      return (
        <input
          type="text"
          value={value === null || value === undefined ? "" : String(value)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
        />
      );
    },
    getEmptyDisplay: () => "—",
  };
}

const longTextHandler: FieldTypeHandler = {
  ...textHandler(10000),
  fieldType: "long_text",
  renderEdit({ value, onChange, disabled, error }) {
    return (
      <textarea
        rows={4}
        value={value === null || value === undefined ? "" : String(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
    );
  },
};

const numberHandler: FieldTypeHandler = {
  fieldType: "number",
  storageColumn: "value_number",
  normalizeInput(raw) {
    if (raw === null || raw === undefined || raw === "") {
      return emptyValue("value_number");
    }

    const parsed =
      typeof raw === "number" ? raw : Number(String(raw).replace(",", "."));
    if (!Number.isFinite(parsed)) {
      return emptyValue("value_number");
    }

    return {
      storageColumn: "value_number",
      value_text: null,
      value_number: parsed,
      value_boolean: null,
      value_date: null,
      value_datetime: null,
      value_json: null,
      isEmpty: false,
    };
  },
  validate(value, field) {
    const required = validateRequired(value.isEmpty, field);
    if (!required.valid) {
      return required;
    }

    if (value.isEmpty || value.value_number === null) {
      return { valid: true };
    }

    return validateNumberRange(value.value_number, field, 0);
  },
  renderDisplay({ value }) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    return String(value);
  },
  renderEdit({ value, onChange, disabled, error }) {
    return (
      <input
        type="number"
        value={value === null || value === undefined ? "" : String(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
    );
  },
  getEmptyDisplay: () => "—",
};

const dateHandler: FieldTypeHandler = {
  fieldType: "date",
  storageColumn: "value_date",
  normalizeInput(raw) {
    if (raw === null || raw === undefined || raw === "") {
      return emptyValue("value_date");
    }

    const value = String(raw).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return emptyValue("value_date");
    }

    return {
      storageColumn: "value_date",
      value_text: null,
      value_number: null,
      value_boolean: null,
      value_date: value,
      value_datetime: null,
      value_json: null,
      isEmpty: false,
    };
  },
  validate(value, field) {
    const required = validateRequired(value.isEmpty, field);
    if (!required.valid) {
      return required;
    }

    if (value.isEmpty) {
      return { valid: true };
    }

    const parsed = Date.parse(`${value.value_date}T00:00:00`);
    if (Number.isNaN(parsed)) {
      return { valid: false, message: "Ungültiges Datum." };
    }

    return { valid: true };
  },
  renderDisplay({ value }) {
    if (!value) {
      return "—";
    }

    return new Date(String(value)).toLocaleDateString("de-DE");
  },
  renderEdit({ value, onChange, disabled, error }) {
    return (
      <input
        type="date"
        value={value ? String(value) : ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
    );
  },
  getEmptyDisplay: () => "—",
};

const booleanHandler: FieldTypeHandler = {
  fieldType: "boolean",
  storageColumn: "value_boolean",
  normalizeInput(raw) {
    if (raw === null || raw === undefined || raw === "") {
      return emptyValue("value_boolean");
    }

    const bool =
      raw === true ||
      raw === "true" ||
      raw === 1 ||
      raw === "1" ||
      raw === "yes";

    return {
      storageColumn: "value_boolean",
      value_text: null,
      value_number: null,
      value_boolean: bool,
      value_date: null,
      value_datetime: null,
      value_json: null,
      isEmpty: false,
    };
  },
  validate(value, field) {
    return validateRequired(value.isEmpty, field);
  },
  renderDisplay({ value }) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return value === true || value === "true" ? "Ja" : "Nein";
  },
  renderEdit({ value, onChange, disabled }) {
    return (
      <label className="custom-field-boolean">
        <input
          type="checkbox"
          checked={value === true || value === "true"}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>Aktiv</span>
      </label>
    );
  },
  getEmptyDisplay: () => "—",
};

function selectHandler(multi: boolean): FieldTypeHandler {
  return {
    fieldType: multi ? "multi_select" : "select",
    storageColumn: multi ? "value_json" : "value_text",
    normalizeInput(raw, _field, options) {
      const activeValues = new Set(
        options
          .filter((option) => !option.is_archived)
          .map((option) => option.value),
      );

      if (multi) {
        const list = Array.isArray(raw)
          ? raw.map(String)
          : typeof raw === "string" && raw
            ? [raw]
            : [];

        const filtered = list.filter((entry) => activeValues.has(entry));
        if (filtered.length === 0) {
          return emptyValue("value_json");
        }

        return {
          storageColumn: "value_json",
          value_text: null,
          value_number: null,
          value_boolean: null,
          value_date: null,
          value_datetime: null,
          value_json: filtered,
          isEmpty: false,
        };
      }

      if (raw === null || raw === undefined || raw === "") {
        return emptyValue("value_text");
      }

      const value = String(raw);
      if (!activeValues.has(value)) {
        return emptyValue("value_text");
      }

      return {
        storageColumn: "value_text",
        value_text: value,
        value_number: null,
        value_boolean: null,
        value_date: null,
        value_datetime: null,
        value_json: null,
        isEmpty: false,
      };
    },
    validate(value, field, options) {
      const required = validateRequired(value.isEmpty, field);
      if (!required.valid) {
        return required;
      }

      if (value.isEmpty) {
        return { valid: true };
      }

      const activeValues = new Set(
        options
          .filter((option) => !option.is_archived)
          .map((option) => option.value),
      );

      if (multi) {
        const list = Array.isArray(value.value_json) ? value.value_json : [];
        const invalid = list.some((entry) => !activeValues.has(String(entry)));
        if (invalid) {
          return { valid: false, message: "Ungültige Auswahl." };
        }
      } else if (
        value.value_text === null ||
        !activeValues.has(value.value_text)
      ) {
        return { valid: false, message: "Ungültige Auswahl." };
      }

      return { valid: true };
    },
    renderDisplay({ value, options }) {
      if (multi) {
        const list = Array.isArray(value) ? value.map(String) : [];
        if (list.length === 0) {
          return "—";
        }

        return list.map((entry) => getOptionLabel(options, entry)).join(", ");
      }

      if (!value) {
        return "—";
      }

      return getOptionLabel(options, String(value));
    },
    renderEdit({ value, options, onChange, disabled, error }) {
      const activeOptions = options
        .filter((option) => !option.is_archived)
        .sort((left, right) => left.order_index - right.order_index);

      if (multi) {
        const selected = new Set(Array.isArray(value) ? value.map(String) : []);

        return (
          <div className="custom-field-multi">
            {activeOptions.map((option) => (
              <label key={option.id} className="custom-field-multi__option">
                <input
                  type="checkbox"
                  checked={selected.has(option.value)}
                  disabled={disabled}
                  onChange={(event) => {
                    const next = new Set(selected);
                    if (event.target.checked) {
                      next.add(option.value);
                    } else {
                      next.delete(option.value);
                    }
                    onChange(Array.from(next));
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
            {error ? <span className="auth-form__error">{error}</span> : null}
          </div>
        );
      }

      return (
        <select
          value={value ? String(value) : ""}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value || null)}
          aria-invalid={Boolean(error)}
        >
          <option value="">—</option>
          {activeOptions.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    },
    getEmptyDisplay: () => "—",
  };
}

const emailHandler: FieldTypeHandler = {
  ...textHandler(255),
  fieldType: "email",
  normalizeInput(raw) {
    const base = textHandler(255).normalizeInput(raw, {} as CustomField, []);
    if (base.isEmpty || base.value_text === null) {
      return base;
    }

    return {
      ...base,
      value_text: base.value_text.toLowerCase(),
    };
  },
  validate(value, field) {
    const required = validateRequired(value.isEmpty, field);
    if (!required.valid) {
      return required;
    }

    if (value.isEmpty || value.value_text === null) {
      return { valid: true };
    }

    const length = validateTextLength(value.value_text, field, 255);
    if (!length.valid) {
      return length;
    }

    return validateEmailFormat(value.value_text);
  },
  renderDisplay({ value }) {
    if (!value) {
      return "—";
    }

    const email = String(value);
    return <a href={`mailto:${email}`}>{email}</a>;
  },
  renderEdit({ value, onChange, disabled, error }) {
    return (
      <input
        type="email"
        value={value ? String(value) : ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
    );
  },
};

const phoneHandler: FieldTypeHandler = {
  ...textHandler(50),
  fieldType: "phone",
  validate(value, field) {
    const required = validateRequired(value.isEmpty, field);
    if (!required.valid) {
      return required;
    }

    if (value.isEmpty || value.value_text === null) {
      return { valid: true };
    }

    const length = validateTextLength(value.value_text, field, 50);
    if (!length.valid) {
      return length;
    }

    return validatePhoneDigits(value.value_text);
  },
  renderDisplay({ value }) {
    if (!value) {
      return "—";
    }

    const phone = String(value);
    return <a href={`tel:${phone}`}>{phone}</a>;
  },
  renderEdit({ value, onChange, disabled, error }) {
    return (
      <input
        type="tel"
        value={value ? String(value) : ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
    );
  },
};

const urlHandler: FieldTypeHandler = {
  ...textHandler(2048),
  fieldType: "url",
  normalizeInput(raw) {
    const base = textHandler(2048).normalizeInput(raw, {} as CustomField, []);
    if (base.isEmpty || base.value_text === null) {
      return base;
    }

    return {
      ...base,
      value_text: normalizeUrl(base.value_text),
    };
  },
  validate(value, field) {
    const required = validateRequired(value.isEmpty, field);
    if (!required.valid) {
      return required;
    }

    if (value.isEmpty || value.value_text === null) {
      return { valid: true };
    }

    const length = validateTextLength(value.value_text, field, 2048);
    if (!length.valid) {
      return length;
    }

    return validateUrlFormat(value.value_text);
  },
  renderDisplay({ value }) {
    if (!value) {
      return "—";
    }

    const url = String(value);
    return (
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
    );
  },
  renderEdit({ value, onChange, disabled, error }) {
    return (
      <input
        type="url"
        value={value ? String(value) : ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
    );
  },
};

const ratingHandler: FieldTypeHandler = {
  fieldType: "rating",
  storageColumn: "value_number",
  normalizeInput(raw, field) {
    if (raw === null || raw === undefined || raw === "") {
      return emptyValue("value_number");
    }

    const parsed = typeof raw === "number" ? raw : Number(String(raw));
    if (!Number.isFinite(parsed)) {
      return emptyValue("value_number");
    }

    const max = getValidationNumber(field, "max", 5);
    const clamped = Math.min(max, Math.max(1, Math.round(parsed)));

    return {
      storageColumn: "value_number",
      value_text: null,
      value_number: clamped,
      value_boolean: null,
      value_date: null,
      value_datetime: null,
      value_json: null,
      isEmpty: false,
    };
  },
  validate(value, field) {
    const required = validateRequired(value.isEmpty, field);
    if (!required.valid) {
      return required;
    }

    if (value.isEmpty || value.value_number === null) {
      return { valid: true };
    }

    return validateNumberRange(value.value_number, field, 1, 5);
  },
  renderDisplay({ value, field }) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const max = getValidationNumber(field, "max", 5);
    return `${String(value)} / ${max}`;
  },
  renderEdit({ value, field, onChange, disabled, error }) {
    const max = getValidationNumber(field, "max", 5);

    return (
      <input
        type="range"
        min={1}
        max={max}
        step={1}
        value={value ? Number(value) : 1}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-invalid={Boolean(error)}
      />
    );
  },
  getEmptyDisplay: () => "—",
};

function unsupportedHandler(
  fieldType: FieldType,
  storageColumn: StorageColumn,
): FieldTypeHandler {
  return {
    fieldType,
    storageColumn,
    normalizeInput() {
      return emptyValue(storageColumn);
    },
    validate(value, field) {
      return validateRequired(value.isEmpty, field);
    },
    renderDisplay() {
      return (
        <span className="shell__notice">Noch nicht in der UI verfügbar</span>
      );
    },
    renderEdit() {
      return (
        <span className="shell__notice">Noch nicht in der UI verfügbar</span>
      );
    },
    getEmptyDisplay: () => "—",
  };
}

export const fieldTypeHandlers: Record<FieldType, FieldTypeHandler> = {
  text: { ...textHandler(255), fieldType: "text" },
  long_text: longTextHandler,
  number: numberHandler,
  currency: unsupportedHandler("currency", "value_number"),
  date: dateHandler,
  datetime: unsupportedHandler("datetime", "value_datetime"),
  boolean: booleanHandler,
  checkbox: unsupportedHandler("checkbox", "value_boolean"),
  select: selectHandler(false),
  multi_select: selectHandler(true),
  email: emailHandler,
  phone: phoneHandler,
  url: urlHandler,
  percentage: unsupportedHandler("percentage", "value_number"),
  rating: ratingHandler,
  user: unsupportedHandler("user", "value_json"),
  relation: unsupportedHandler("relation", "value_json"),
};
