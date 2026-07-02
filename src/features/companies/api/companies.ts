import { supabase } from "../../../shared/lib/supabase/client";
import { COMPANY_LIST_COLUMNS } from "../company.constants";
import type {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
} from "../company.types";

function getClient() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase;
}

function normalizeOptionalText(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function fetchCompanies(workspaceId: string): Promise<Company[]> {
  const client = getClient();

  const { data, error } = await client
    .from("companies")
    .select(COMPANY_LIST_COLUMNS)
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Company[];
}

export async function fetchCompanyById(
  companyId: string,
  workspaceId: string,
): Promise<Company | null> {
  const client = getClient();

  const { data, error } = await client
    .from("companies")
    .select(COMPANY_LIST_COLUMNS)
    .eq("id", companyId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Company | null) ?? null;
}

export async function createCompany(
  input: CompanyCreateInput,
  workspaceId: string,
  userId: string,
): Promise<Company> {
  const client = getClient();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Der Firmenname ist erforderlich.");
  }

  const { data, error } = await client
    .from("companies")
    .insert({
      workspace_id: workspaceId,
      name,
      website: normalizeOptionalText(input.website),
      linkedin_url: normalizeOptionalText(input.linkedin_url),
      phone: normalizeOptionalText(input.phone),
      email: normalizeOptionalText(input.email),
      city: normalizeOptionalText(input.city),
      country: normalizeOptionalText(input.country) ?? "DE",
      industry: normalizeOptionalText(input.industry),
      employee_count_range: normalizeOptionalText(input.employee_count_range),
      contact_discovery_status: input.contact_discovery_status ?? "unknown",
      lifecycle_status: input.lifecycle_status ?? "lead",
      next_action_at: input.next_action_at ?? null,
      notes_summary: normalizeOptionalText(input.notes_summary),
      created_by: userId,
      owner_id: userId,
    })
    .select(COMPANY_LIST_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as Company;
}

export async function updateCompany(
  companyId: string,
  input: CompanyUpdateInput,
  workspaceId: string,
): Promise<Company> {
  const client = getClient();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Der Firmenname ist erforderlich.");
    }
    payload.name = name;
  }

  if (input.website !== undefined) {
    payload.website = normalizeOptionalText(input.website);
  }
  if (input.linkedin_url !== undefined) {
    payload.linkedin_url = normalizeOptionalText(input.linkedin_url);
  }
  if (input.phone !== undefined) {
    payload.phone = normalizeOptionalText(input.phone);
  }
  if (input.email !== undefined) {
    payload.email = normalizeOptionalText(input.email);
  }
  if (input.city !== undefined) {
    payload.city = normalizeOptionalText(input.city);
  }
  if (input.country !== undefined) {
    payload.country = normalizeOptionalText(input.country);
  }
  if (input.industry !== undefined) {
    payload.industry = normalizeOptionalText(input.industry);
  }
  if (input.employee_count_range !== undefined) {
    payload.employee_count_range = normalizeOptionalText(
      input.employee_count_range,
    );
  }
  if (input.contact_discovery_status !== undefined) {
    payload.contact_discovery_status = input.contact_discovery_status;
  }
  if (input.lifecycle_status !== undefined) {
    payload.lifecycle_status = input.lifecycle_status;
  }
  if (input.next_action_at !== undefined) {
    payload.next_action_at = input.next_action_at;
  }
  if (input.notes_summary !== undefined) {
    payload.notes_summary = normalizeOptionalText(input.notes_summary);
  }

  const { data, error } = await client
    .from("companies")
    .update(payload)
    .eq("id", companyId)
    .eq("workspace_id", workspaceId)
    .select(COMPANY_LIST_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as Company;
}

export async function archiveCompany(
  companyId: string,
  workspaceId: string,
): Promise<Company> {
  const client = getClient();
  const archivedAt = new Date().toISOString();

  const { data, error } = await client
    .from("companies")
    .update({
      archived_at: archivedAt,
      lifecycle_status: "archived",
    })
    .eq("id", companyId)
    .eq("workspace_id", workspaceId)
    .select(COMPANY_LIST_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as Company;
}
