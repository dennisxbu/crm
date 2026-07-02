// PHASE 3 APP SHELL — temporary technical scaffold, not the final CRM UI.
// Do NOT evolve this into final CRM screens or derive design decisions from it.
// UI/UX is defined separately in docs/ui-ux-brief-for-claude.md (later phase).
// See src/app/README.md for details.
import { useAuth } from "./providers/AuthProvider";
import { useWorkspace } from "./providers/WorkspaceProvider";
import { AuthForm } from "../features/auth/components/AuthForm";
import { CompaniesSection } from "../features/companies/components/CompaniesSection";
import { isSupabaseConfigured } from "../shared/lib/supabase/client";
import "./App.css";

export function App() {
  const {
    user,
    profile,
    isLoading: authLoading,
    error: authError,
    signOut,
  } = useAuth();
  const {
    activeWorkspace,
    memberships,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace();

  const envConfigured = isSupabaseConfigured();
  const activeMembership = memberships.find(
    (membership) => membership.workspace_id === activeWorkspace?.id,
  );

  if (!envConfigured) {
    return (
      <main className="shell">
        <header className="shell__header">
          <p className="shell__eyebrow">Blumenthal Systems</p>
          <h1>CRM — Phase 3</h1>
          <p className="shell__lead">
            Company Core foundation. No final CRM UI.
          </p>
        </header>
        <section className="panel">
          <p className="shell__notice">
            Missing <code>.env.local</code>. Set <code>VITE_SUPABASE_URL</code>{" "}
            and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.
          </p>
        </section>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="shell">
        <p className="shell__notice">Session wird geladen…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="shell">
        <header className="shell__header">
          <p className="shell__eyebrow">Blumenthal Systems</p>
          <h1>CRM — Phase 3</h1>
          <p className="shell__lead">
            Company Core foundation. No final CRM UI.
          </p>
        </header>
        {authError ? <p className="shell__error">{authError}</p> : null}
        <AuthForm />
      </main>
    );
  }

  return (
    <main className="shell shell--wide">
      <header className="shell__header">
        <p className="shell__eyebrow">Blumenthal Systems</p>
        <h1>CRM — Phase 3</h1>
        <p className="shell__lead">
          Phase 3 Company Core — functional shell, not final CRM UI.
        </p>
      </header>

      {authError ? <p className="shell__error">{authError}</p> : null}
      {workspaceError ? <p className="shell__error">{workspaceError}</p> : null}

      <section className="panel" aria-labelledby="session-heading">
        <h2 id="session-heading">Session</h2>
        <dl className="status-list">
          <div className="status-list__row">
            <dt>E-Mail</dt>
            <dd>{user.email ?? "—"}</dd>
          </div>
          <div className="status-list__row">
            <dt>Profil</dt>
            <dd>{profile?.full_name ?? "—"}</dd>
          </div>
          <div className="status-list__row">
            <dt>Workspace</dt>
            <dd>
              {workspaceLoading
                ? "Wird geladen…"
                : (activeWorkspace?.name ?? "—")}
            </dd>
          </div>
          <div className="status-list__row">
            <dt>Rolle</dt>
            <dd>{activeMembership?.role ?? "—"}</dd>
          </div>
        </dl>
        <button
          className="auth-form__submit"
          type="button"
          onClick={() => void signOut()}
        >
          Abmelden
        </button>
      </section>

      <CompaniesSection />
    </main>
  );
}
