# DEVELOPMENT.md

Entwicklungsrichtlinien für das Blumenthal Systems CRM. Dieses Dokument beschreibt perspektivisch, wie lokale Entwicklung und Feature-Arbeit ablaufen sollen — ab Phase 1.

## Voraussetzungen (perspektivisch, ab Phase 1)

| Tool | Zweck |
|------|-------|
| Node.js (LTS) | Frontend-Tooling |
| pnpm oder npm | Package Manager |
| Supabase CLI | Lokale DB, Migrationen |
| Docker | Supabase local dev (via CLI) |
| Git | Versionskontroll |

Konkrete Versionen werden in Phase 1 festgelegt und hier ergänzt.

## Lokale Entwicklung (perspektivisch)

```bash
# Phase 1+ — Beispielablauf, noch nicht aktiv
cp .env.example .env.local
# Werte aus Supabase Dashboard oder lokaler Instanz eintragen

# Supabase lokal starten (wenn CLI eingerichtet)
supabase start

# Frontend starten (wenn Stack initialisiert)
pnpm install
pnpm dev
```

Bis Phase 1 ist **kein** lokaler Dev-Server nötig. Dieses Repo enthält noch keine App.

## Supabase-Konzept

- **Postgres** als einzige Datenquelle für CRM-Daten
- **Supabase Auth** für Benutzer-Authentifizierung
- **Row Level Security (RLS)** für Workspace-Isolation
- **Migrationen** in `supabase/migrations/` — keine manuelle Schema-Änderung im Dashboard für produktive Struktur
- Details: `docs/supabase-and-rls.md`

## Environment Variables

| Variable | Wo | Beschreibung |
|----------|-----|--------------|
| `VITE_SUPABASE_URL` | Frontend | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Public anon key (RLS-geschützt) |

**Niemals** im Frontend oder in Git:

- Service Role Key
- DB Connection Strings mit Superuser-Rechten
- Echte Secrets in `.env.example`

`.env`, `.env.local` und ähnliche Dateien sind in `.gitignore`.

## Branch-Konventionen

| Präfix | Verwendung |
|--------|------------|
| `feat/` | Neues Feature innerhalb einer Roadmap-Phase |
| `fix/` | Bugfix |
| `docs/` | Nur Dokumentation |
| `chore/` | Tooling, Config ohne Feature-Logik |

Beispiel: `feat/phase-3-company-core`

## Commit-Konventionen

Kurze, imperative Subject-Zeile. Fokus auf **warum**, nicht nur was.

```
feat(companies): add workspace-scoped company list query

Enables Phase 3 company table without hardcoded fields.
Refs docs/data-model.md companies table.
```

## Neue Features planen

1. **Phase prüfen** — Passt das Feature in die aktuelle Roadmap-Phase? (`docs/implementation-roadmap.md`)
2. **Spec prüfen** — Steht es in `docs/product-spec.md` oder ist es Scope Creep?
3. **Architektur prüfen** — Verletzt es metadata-driven oder company-first Prinzipien?
4. **Docs zuerst** — Bei Datenmodell- oder Architekturänderungen Docs **vor** Code aktualisieren
5. **Definition of Done** — `docs/definitions-of-done.md` als Checkliste
6. **Implementieren** — Scope der Phase nicht überschreiten

## Docs vor Implementierung aktualisieren

Wenn sich ändert:

- Tabellenstruktur → `docs/data-model.md`
- Architekturentscheidung → `docs/architecture.md`
- Produktverhalten → `docs/product-spec.md`
- Custom-Field-Verhalten → `docs/custom-fields.md`
- Pipeline/View-Verhalten → `docs/pipelines-and-views.md`
- Sicherheit/RLS → `docs/supabase-and-rls.md`

Commit für Doc-Updates kann separat oder im selben PR erfolgen — aber Docs dürfen nicht hinter Code zurückbleiben.

## AI-gestützte Entwicklung

Siehe `docs/ai-development-workflow.md` und `.cursor/rules/`.

Agenten müssen vor Implementierung relevante Docs und Rules lesen. Keine Features gegen dokumentierte Prinzipien.

## Tests (perspektivisch)

- Unit-Tests für Business Logic (Custom Field Validation, View Config Parsing)
- Integrationstests für Supabase-Queries mit RLS
- Keine Tests in Phase 0 — Struktur in `tests/README.md`

Details zu Teststrategie werden in Phase 1/11 konkretisiert.

## Code-Organisation (perspektivisch)

Geplante Trennung — Details in `docs/architecture.md`:

- **System fields** — feste Spalten auf Entity-Tabellen (name, website, …)
- **Custom fields** — metadata in `custom_fields`, Werte in `custom_field_values`
- **Configuration** — pipelines, stages, views in eigenen Tabellen
- **UI state** — View-Präferenzen, Spaltenbreiten etc. getrennt von Business-Daten

## Mermaid — vereinfacht:

```
companies (system fields)
    ↕ entity_pipeline_positions → pipeline_stages → pipelines
    ↕ custom_field_values → custom_fields
    ↕ views (display config)
```

## Qualität

Kein Merge von Features, die gegen `docs/definitions-of-done.md` verstoßen. Keine hardcoded Business-Konfiguration. Keine Contact-first-Abkürzungen.

## Phase 0 Status

Aktuell: **nur Dokumentation und Struktur**. Kein `package.json`, kein Supabase-Projekt, kein Frontend-Code.
