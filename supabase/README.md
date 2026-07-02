# supabase/

Supabase-Integration für das Blumenthal Systems CRM.

## Struktur

```
supabase/
├── config.toml          # Supabase CLI Konfiguration (project_id: crm)
├── migrations/          # SQL-Migrationen (einzige Schema-Quelle)
│   ├── 20260701120000_phase1_extensions_and_profiles.sql
│   ├── 20260702140000_phase2_auth_workspaces.sql
│   ├── 20260703140000_phase3_companies.sql
│   └── 20260703150000_fix_companies_update_rls.sql
└── .gitignore
```

**Keine manuellen Schema-Änderungen im Supabase Dashboard** für produktive Tabellen.
Alle Änderungen nur via Migrationen in `migrations/`.

## Befehle (via pnpm)

```bash
pnpm db:start    # Lokale Instanz starten (Docker erforderlich)
pnpm db:stop     # Stoppen
pnpm db:reset    # Migrationen neu anwenden
pnpm exec supabase status   # URLs und Keys anzeigen
```

Remote (nach `npx supabase link`):

```bash
npx supabase db push        # Migrationen auf Remote anwenden
npx supabase db push --dry-run
```

## Migrationen

| Datei                                               | Phase | Inhalt                                                                                       |
| --------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------- |
| `20260701120000_phase1_extensions_and_profiles.sql` | 1     | `pgcrypto`, `profiles` stub, RLS, Grants                                                     |
| `20260702140000_phase2_auth_workspaces.sql`         | 2     | Auth trigger, `workspaces`, `workspace_members`, RLS helpers, `create_initial_workspace` RPC |
| `20260703140000_phase3_companies.sql`               | 3     | `companies` Tabelle, Indexes, RLS, Grants                                                    |
| `20260703150000_fix_companies_update_rls.sql`       | 3     | Owner-scoped UPDATE policy, immutable column trigger                                         |

Keine CRM-Tabellen aus späteren Phasen (contacts, deals, pipelines, custom_fields, views).

## Lokale URLs (Standard)

| Service | URL                    |
| ------- | ---------------------- |
| API     | http://127.0.0.1:54321 |
| Studio  | http://127.0.0.1:54323 |
| DB      | localhost:54322        |

Detail: `docs/supabase-and-rls.md` · ADR: `docs/adr/004-workspaces-rls.md`
