import type { Company } from "../companies/company.types";
import {
  CONTACT_DISCOVERY_STATUS_LABELS,
  LIFECYCLE_STATUS_LABELS,
} from "../companies/company.constants";
import type { FieldType } from "../custom-fields/custom-field.types";
import type { FieldRef } from "./view.types";

export type SystemCompanyFieldKey =
  | "name"
  | "website"
  | "domain"
  | "linkedin_url"
  | "phone"
  | "email"
  | "city"
  | "country"
  | "industry"
  | "employee_count_range"
  | "contact_discovery_status"
  | "lifecycle_status"
  | "created_at"
  | "updated_at";

export type SystemCompanyFieldDefinition = {
  key: SystemCompanyFieldKey;
  label: string;
  fieldType: FieldType | "status";
  sortable: boolean;
  filterable: boolean;
  getValue: (company: Company) => unknown;
  formatDisplay: (value: unknown) => string;
};

function formatDate(value: unknown): string {
  if (!value || typeof value !== "string") {
    return "—";
  }

  return new Date(value).toLocaleString("de-DE");
}

function formatText(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

export const SYSTEM_COMPANY_FIELDS: Record<
  SystemCompanyFieldKey,
  SystemCompanyFieldDefinition
> = {
  name: {
    key: "name",
    label: "Name",
    fieldType: "text",
    sortable: true,
    filterable: true,
    getValue: (company) => company.name,
    formatDisplay: formatText,
  },
  website: {
    key: "website",
    label: "Website",
    fieldType: "url",
    sortable: true,
    filterable: true,
    getValue: (company) => company.website,
    formatDisplay: formatText,
  },
  domain: {
    key: "domain",
    label: "Domain",
    fieldType: "text",
    sortable: true,
    filterable: true,
    getValue: (company) => company.domain,
    formatDisplay: formatText,
  },
  linkedin_url: {
    key: "linkedin_url",
    label: "LinkedIn",
    fieldType: "url",
    sortable: true,
    filterable: true,
    getValue: (company) => company.linkedin_url,
    formatDisplay: formatText,
  },
  phone: {
    key: "phone",
    label: "Telefon",
    fieldType: "phone",
    sortable: false,
    filterable: true,
    getValue: (company) => company.phone,
    formatDisplay: formatText,
  },
  email: {
    key: "email",
    label: "E-Mail",
    fieldType: "email",
    sortable: true,
    filterable: true,
    getValue: (company) => company.email,
    formatDisplay: formatText,
  },
  city: {
    key: "city",
    label: "Stadt",
    fieldType: "text",
    sortable: true,
    filterable: true,
    getValue: (company) => company.city,
    formatDisplay: formatText,
  },
  country: {
    key: "country",
    label: "Land",
    fieldType: "text",
    sortable: true,
    filterable: true,
    getValue: (company) => company.country,
    formatDisplay: formatText,
  },
  industry: {
    key: "industry",
    label: "Branche",
    fieldType: "text",
    sortable: true,
    filterable: true,
    getValue: (company) => company.industry,
    formatDisplay: formatText,
  },
  employee_count_range: {
    key: "employee_count_range",
    label: "Mitarbeiter",
    fieldType: "text",
    sortable: true,
    filterable: true,
    getValue: (company) => company.employee_count_range,
    formatDisplay: formatText,
  },
  contact_discovery_status: {
    key: "contact_discovery_status",
    label: "Kontakt-Recherche",
    fieldType: "status",
    sortable: true,
    filterable: true,
    getValue: (company) => company.contact_discovery_status,
    formatDisplay: (value) =>
      CONTACT_DISCOVERY_STATUS_LABELS[
        value as keyof typeof CONTACT_DISCOVERY_STATUS_LABELS
      ] ?? "—",
  },
  lifecycle_status: {
    key: "lifecycle_status",
    label: "Lifecycle",
    fieldType: "status",
    sortable: true,
    filterable: true,
    getValue: (company) => company.lifecycle_status,
    formatDisplay: (value) =>
      LIFECYCLE_STATUS_LABELS[value as keyof typeof LIFECYCLE_STATUS_LABELS] ??
      "—",
  },
  created_at: {
    key: "created_at",
    label: "Erstellt",
    fieldType: "datetime",
    sortable: true,
    filterable: false,
    getValue: (company) => company.created_at,
    formatDisplay: formatDate,
  },
  updated_at: {
    key: "updated_at",
    label: "Aktualisiert",
    fieldType: "datetime",
    sortable: true,
    filterable: false,
    getValue: (company) => company.updated_at,
    formatDisplay: formatDate,
  },
};

export function getSystemFieldRef(key: SystemCompanyFieldKey): FieldRef {
  return `system:${key}`;
}

export function parseSystemFieldKey(
  fieldRef: FieldRef,
): SystemCompanyFieldKey | null {
  if (!fieldRef.startsWith("system:")) {
    return null;
  }

  const key = fieldRef.slice("system:".length) as SystemCompanyFieldKey;
  return key in SYSTEM_COMPANY_FIELDS ? key : null;
}

export function listSystemCompanyFields(): SystemCompanyFieldDefinition[] {
  return Object.values(SYSTEM_COMPANY_FIELDS);
}
