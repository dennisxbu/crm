import { supabase, isSupabaseConfigured } from "./client";

export type SupabaseHealthStatus = {
  state:
    "missing_env" | "connected" | "schema_missing" | "unreachable" | "error";
  message: string;
};

export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      state: "missing_env",
      message:
        "VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY missing. Copy .env.example to .env.local and fill in values.",
    };
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (!error) {
      return {
        state: "connected",
        message: "Supabase reachable — profiles table OK.",
      };
    }

    if (error.code === "PGRST205" || error.message.includes("does not exist")) {
      return {
        state: "schema_missing",
        message:
          "Supabase reachable, but profiles table missing — run `pnpm db:reset`.",
      };
    }

    if (error.message.toLowerCase().includes("fetch")) {
      return { state: "unreachable", message: "Cannot reach Supabase API." };
    }

    // RLS without session is expected in Phase 1 — API + schema are reachable.
    return {
      state: "connected",
      message: `Supabase reachable (${error.code ?? "schema OK"}).`,
    };
  } catch {
    return { state: "unreachable", message: "Cannot reach Supabase API." };
  }
}
