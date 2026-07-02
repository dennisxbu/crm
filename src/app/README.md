# src/app — App Shell

## Phase 2: Temporäre Auth-/Workspace-Shell

`App.tsx` ist eine **technische Auth-/Workspace-Shell** — kein CRM-UI und keine Basis für spätere Screens.

**Was es ist:**

- Login / Registrierung / Logout
- Session- und Profil-Anzeige
- Aktiver Workspace + Rolle
- AuthProvider + WorkspaceProvider

**Was es nicht ist:**

- Kein finales CRM-Layout
- Kein Design-System-Seed
- Keine Vorlage für Company-Listen, Kanban oder Settings
- Keine Basis für das visuelle Design des Produkts

## Struktur (Phase 2)

```
src/app/
  App.tsx                    Phase-2-Shell
  providers/
    AuthProvider.tsx         Session, Profil, signIn/signUp/signOut
    WorkspaceProvider.tsx    Memberships, aktiver Workspace, RPC-Onboarding
src/features/auth/         AuthForm, API, Types
src/features/workspaces/     Workspace API, Types
```

## Was hier ab Phase 3 entstehen wird

- Routing (React Router o.ä.)
- CRM-Feature-Screens nach Roadmap
- Layout nach `docs/ui-ux-brief-for-claude.md`

Diese Shell wird **nicht** zur Produkt-UI ausgebaut — CRM-Screens entstehen separat nach UX-Brief.

## Leitlinien für AI-Agenten

- Phase-2-Shell minimal halten — keine CRM-Features vorziehen
- Kein Design-System, keine Component Library einführen
- Kein CRM-Screen aus `App.tsx` herauswachsen lassen
- UX-Entscheidungen folgen erst `docs/ui-ux-brief-for-claude.md`
- Roadmap-Phase immer prüfen: `docs/implementation-roadmap.md`
