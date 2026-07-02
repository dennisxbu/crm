import { useState, type FormEvent } from "react";
import {
  CONTACT_DISCOVERY_STATUSES,
  CONTACT_DISCOVERY_STATUS_LABELS,
  LIFECYCLE_STATUSES,
  LIFECYCLE_STATUS_LABELS,
} from "../company.constants";
import type {
  Company,
  CompanyCreateInput,
  ContactDiscoveryStatus,
  LifecycleStatus,
} from "../company.types";

type CompanyFormProps = {
  mode: "create" | "edit";
  initialCompany?: Company;
  onSubmit: (input: CompanyCreateInput) => Promise<void>;
  onCancel?: () => void;
};

type FormState = {
  name: string;
  website: string;
  linkedin_url: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  industry: string;
  employee_count_range: string;
  contact_discovery_status: ContactDiscoveryStatus;
  lifecycle_status: LifecycleStatus;
  next_action_at: string;
  notes_summary: string;
};

function toFormState(company?: Company): FormState {
  return {
    name: company?.name ?? "",
    website: company?.website ?? "",
    linkedin_url: company?.linkedin_url ?? "",
    phone: company?.phone ?? "",
    email: company?.email ?? "",
    city: company?.city ?? "",
    country: company?.country ?? "DE",
    industry: company?.industry ?? "",
    employee_count_range: company?.employee_count_range ?? "",
    contact_discovery_status: company?.contact_discovery_status ?? "unknown",
    lifecycle_status: company?.lifecycle_status ?? "lead",
    next_action_at: company?.next_action_at
      ? company.next_action_at.slice(0, 16)
      : "",
    notes_summary: company?.notes_summary ?? "",
  };
}

function toPayload(state: FormState): CompanyCreateInput {
  return {
    name: state.name,
    website: state.website,
    linkedin_url: state.linkedin_url,
    phone: state.phone,
    email: state.email,
    city: state.city,
    country: state.country,
    industry: state.industry,
    employee_count_range: state.employee_count_range,
    contact_discovery_status: state.contact_discovery_status,
    lifecycle_status: state.lifecycle_status,
    next_action_at: state.next_action_at
      ? new Date(state.next_action_at).toISOString()
      : null,
    notes_summary: state.notes_summary,
  };
}

export function CompanyForm({
  mode,
  initialCompany,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const [formState, setFormState] = useState<FormState>(() =>
    toFormState(initialCompany),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(toPayload(formState));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Speichern fehlgeschlagen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  return (
    <form className="company-form" onSubmit={handleSubmit}>
      <label className="auth-form__field">
        <span>Firmenname *</span>
        <input
          type="text"
          required
          value={formState.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>Website</span>
        <input
          type="url"
          value={formState.website}
          onChange={(event) => updateField("website", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>LinkedIn</span>
        <input
          type="url"
          value={formState.linkedin_url}
          onChange={(event) => updateField("linkedin_url", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>Telefon</span>
        <input
          type="tel"
          value={formState.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>E-Mail</span>
        <input
          type="email"
          value={formState.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>Stadt</span>
        <input
          type="text"
          value={formState.city}
          onChange={(event) => updateField("city", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>Land</span>
        <input
          type="text"
          value={formState.country}
          onChange={(event) => updateField("country", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>Branche</span>
        <input
          type="text"
          value={formState.industry}
          onChange={(event) => updateField("industry", event.target.value)}
        />
      </label>

      <label className="auth-form__field">
        <span>Mitarbeiterzahl</span>
        <input
          type="text"
          value={formState.employee_count_range}
          onChange={(event) =>
            updateField("employee_count_range", event.target.value)
          }
        />
      </label>

      <label className="auth-form__field">
        <span>Kontakt-Recherche</span>
        <select
          value={formState.contact_discovery_status}
          onChange={(event) =>
            updateField(
              "contact_discovery_status",
              event.target.value as ContactDiscoveryStatus,
            )
          }
        >
          {CONTACT_DISCOVERY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CONTACT_DISCOVERY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="auth-form__field">
        <span>Lifecycle</span>
        <select
          value={formState.lifecycle_status}
          onChange={(event) =>
            updateField(
              "lifecycle_status",
              event.target.value as LifecycleStatus,
            )
          }
        >
          {LIFECYCLE_STATUSES.filter((status) => status !== "archived").map(
            (status) => (
              <option key={status} value={status}>
                {LIFECYCLE_STATUS_LABELS[status]}
              </option>
            ),
          )}
        </select>
      </label>

      <label className="auth-form__field">
        <span>Nächste Aktion</span>
        <input
          type="datetime-local"
          value={formState.next_action_at}
          onChange={(event) =>
            updateField("next_action_at", event.target.value)
          }
        />
      </label>

      <label className="auth-form__field">
        <span>Notizen</span>
        <textarea
          rows={3}
          value={formState.notes_summary}
          onChange={(event) => updateField("notes_summary", event.target.value)}
        />
      </label>

      {formError ? <p className="auth-form__error">{formError}</p> : null}

      <div className="company-form__actions">
        <button
          className="auth-form__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Speichern…"
            : mode === "create"
              ? "Unternehmen anlegen"
              : "Änderungen speichern"}
        </button>
        {onCancel ? (
          <button
            className="company-form__secondary"
            type="button"
            onClick={onCancel}
          >
            Abbrechen
          </button>
        ) : null}
      </div>
    </form>
  );
}
