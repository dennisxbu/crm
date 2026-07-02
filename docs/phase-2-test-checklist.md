# Phase 2 — Test Checklist

Manuelle Prüfung der Auth-/Workspace-Foundation. Keine CRM-Features erwartet.

## Voraussetzungen

1. `.env.local` korrekt gesetzt:

```env
VITE_SUPABASE_URL=https://fzormgxabytjfnqjtruy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

2. Phase-2-Migration angewendet:

```bash
# Lokal (Docker):
pnpm db:reset

# Remote:
npx supabase link --project-ref fzormgxabytjfnqjtruy
npx supabase db push
```

## Build checks

```bash
pnpm install
pnpm lint
pnpm build
```

Erwartung: beide Befehle ohne Fehler.

## Dev server

```bash
pnpm dev
```

Öffne http://localhost:5173

## Auth flow

- [ ] Registrierung mit E-Mail + Passwort funktioniert
- [ ] Login mit bestehendem User funktioniert
- [ ] Nach Reload bleibt Session erhalten
- [ ] Logout funktioniert und zeigt wieder Login-Formular

## Profile

- [ ] Nach Registrierung existiert ein `profiles`-Eintrag (`id = auth.users.id`)
- [ ] Profilname wird angezeigt, falls bei Registrierung gesetzt
- [ ] E-Mail wird in der Session-Shell angezeigt

## Workspace

- [ ] Nach erstem Login wird automatisch ein Workspace erstellt (`Blumenthal Systems`)
- [ ] User ist `owner` in `workspace_members`
- [ ] Aktiver Workspace wird in der Shell angezeigt
- [ ] Zweiter Login erstellt keinen zweiten Workspace (idempotent)

## RLS (grob)

In Supabase SQL Editor oder Studio mit authentifiziertem User:

- [ ] User sieht nur eigene Memberships
- [ ] User sieht nur Workspaces, in denen er Member ist
- [ ] Anonymer Zugriff auf `profiles`, `workspaces`, `workspace_members` ohne Policy schlägt fehl

## Scope check (bewusst nicht vorhanden)

- [ ] Keine Companies-UI
- [ ] Keine Contacts / Deals
- [ ] Keine Pipelines / Kanban / Tabellen
- [ ] Keine Custom Fields
- [ ] Keine Settings-UI
- [ ] Keine Sidebar / CRM-Navigation
- [ ] Keine Mock-CRM-Daten

## Env / Security grep

```bash
grep -R "NEXT_PUBLIC_SUPABASE" .
grep -R "VITE_SUPABASE_ANON_KEY" .
grep -R "service_role" src .env.example docs README.md DEVELOPMENT.md
```

Erwartung:

- Erste zwei Greps: nur historische ADR-/Checklist-Referenzen
- Kein Service Role Key im Frontend oder committeden Dateien

## Optional — Supabase CLI

```bash
npx supabase --version
npx supabase status   # nur bei lokalem Stack
```
