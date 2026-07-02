import { supabase } from "../../../shared/lib/supabase/client";
import type { Profile } from "../../workspaces/workspace.types";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
