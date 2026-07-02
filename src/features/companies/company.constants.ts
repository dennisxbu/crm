export const CONTACT_DISCOVERY_STATUSES = [
  "unknown",
  "not_started",
  "researching",
  "partial_contacts_found",
  "decision_maker_identified",
  "no_contact_found",
] as const;

export const LIFECYCLE_STATUSES = [
  "lead",
  "prospect",
  "active_opportunity",
  "customer",
  "disqualified",
  "archived",
] as const;

export const CONTACT_DISCOVERY_STATUS_LABELS: Record<
  (typeof CONTACT_DISCOVERY_STATUSES)[number],
  string
> = {
  unknown: "Unbekannt",
  not_started: "Nicht gestartet",
  researching: "Recherche läuft",
  partial_contacts_found: "Teilkontakte gefunden",
  decision_maker_identified: "Entscheider identifiziert",
  no_contact_found: "Kein Kontakt gefunden",
};

export const LIFECYCLE_STATUS_LABELS: Record<
  (typeof LIFECYCLE_STATUSES)[number],
  string
> = {
  lead: "Lead",
  prospect: "Prospect",
  active_opportunity: "Aktive Chance",
  customer: "Kunde",
  disqualified: "Disqualifiziert",
  archived: "Archiviert",
};

export const COMPANY_LIST_COLUMNS = `
  id,
  workspace_id,
  name,
  website,
  domain,
  linkedin_url,
  phone,
  email,
  city,
  country,
  industry,
  employee_count_range,
  contact_discovery_status,
  lifecycle_status,
  owner_id,
  next_action_at,
  last_activity_at,
  last_contacted_at,
  notes_summary,
  created_by,
  created_at,
  updated_at,
  archived_at
` as const;
