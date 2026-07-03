import type {
  CustomField,
  CustomFieldOption,
} from "../../custom-fields/custom-field.types";
import { getFieldTypeHandler } from "../../custom-fields/field-registry/fieldTypeRegistry";
import { SYSTEM_COMPANY_FIELDS } from "../system-field-registry";
import type { ResolvedTableField } from "../view.types";

type CompanyTableCellProps = {
  field: ResolvedTableField;
  displayValue: unknown;
  customField?: CustomField;
  customFieldOptions: CustomFieldOption[];
};

export function CompanyTableCell({
  field,
  displayValue,
  customField,
  customFieldOptions,
}: CompanyTableCellProps) {
  if (field.missing) {
    return <span className="company-table__missing">Fehlendes Feld</span>;
  }

  if (field.source === "system" && field.systemKey) {
    const definition =
      SYSTEM_COMPANY_FIELDS[
        field.systemKey as keyof typeof SYSTEM_COMPANY_FIELDS
      ];
    const text = definition.formatDisplay(displayValue);

    if (field.systemKey === "website" && displayValue) {
      const raw = String(displayValue);
      const href = raw.startsWith("http") ? raw : `https://${raw}`;
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {text}
        </a>
      );
    }

    if (field.systemKey === "linkedin_url" && displayValue) {
      const href = String(displayValue);
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {text}
        </a>
      );
    }

    return <span>{text}</span>;
  }

  if (field.source === "custom" && customField) {
    const handler = getFieldTypeHandler(customField.field_type);
    const options = customFieldOptions.filter(
      (option) => option.custom_field_id === customField.id,
    );

    return (
      <span className="company-table__custom-cell">
        {handler.renderDisplay({
          field: customField,
          options,
          value: displayValue,
          onChange: () => undefined,
        })}
      </span>
    );
  }

  return <span>—</span>;
}
