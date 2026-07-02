import type {
  CONTACT_DISCOVERY_STATUSES,
  LIFECYCLE_STATUSES,
} from "./company.constants";

export type ContactDiscoveryStatus =
  (typeof CONTACT_DISCOVERY_STATUSES)[number];

export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];

export type Company = {
  id: string;
  workspace_id: string;
  name: string;
  website: string | null;
  domain: string | null;
  linkedin_url: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  employee_count_range: string | null;
  contact_discovery_status: ContactDiscoveryStatus;
  lifecycle_status: LifecycleStatus;
  owner_id: string | null;
  next_action_at: string | null;
  last_activity_at: string | null;
  last_contacted_at: string | null;
  notes_summary: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type CompanyCreateInput = {
  name: string;
  website?: string | null;
  linkedin_url?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  country?: string | null;
  industry?: string | null;
  employee_count_range?: string | null;
  contact_discovery_status?: ContactDiscoveryStatus;
  lifecycle_status?: LifecycleStatus;
  next_action_at?: string | null;
  notes_summary?: string | null;
};

export type CompanyUpdateInput = Partial<
  Omit<CompanyCreateInput, "name"> & { name: string }
>;

export type CompaniesContextState = {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  refreshCompanies: () => Promise<void>;
  selectCompany: (companyId: string | null) => Promise<void>;
  createCompany: (input: CompanyCreateInput) => Promise<Company>;
  updateCompany: (
    companyId: string,
    input: CompanyUpdateInput,
  ) => Promise<Company>;
  archiveCompany: (companyId: string) => Promise<Company>;
};
