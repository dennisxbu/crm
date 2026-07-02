# Produktspezifikation — Blumenthal Systems CRM

## Produktvision

Ein hochwertiges, konfigurierbares B2B-Akquise-CRM — inspiriert von der Konfigurierbarkeit von monday, der Pipeline-Klarheit von Pipedrive und der Tiefe von HubSpot, aber als eigenständiges System für den spezifischen Workflow von Blumenthal Systems.

Langfristig soll das CRM ein **Akquise-Betriebssystem** werden: metadata-driven, company-first, mit echten Custom Fields, konfigurierbaren Pipelines und Views — nicht eine Sammlung hardcoded CRUD-Tabellen.

## Zielgruppe

**Primärer Nutzer:** Dennis Blumenthal, Solo-Berater bei Blumenthal Systems.

**Indirekte Zielgruppe der Akquise:** Kleine Personalberatungen, Personalvermittler, Headhunter und Executive-Search-Firmen im DACH-Raum, die Workflow-Automatisierung, KI-Prozesse und Prozessoptimierung benötigen.

Das CRM ist ein **privates Werkzeug** für eigene Akquise, kein Multi-Tenant-SaaS-Produkt für externe Kunden (Workspace-Konzept dient der technischen Struktur, nicht dem Verkauf an Dritte).

## Nutzerkontext

Typischer Akquise-Alltag:

1. Unternehmen identifizieren (LinkedIn, Branchenlisten, Empfehlungen, Recherche)
2. Unternehmen bewerten (Passt Größe, Branche, Pain Point?)
3. Kontakt recherchieren (optional — oft erst später)
4. Outreach (E-Mail, Telefon, LinkedIn)
5. Gespräch führen, Bedarf klären
6. Bei konkreter Chance: Deal anlegen
7. Angebot, Verhandlung, Abschluss oder Verlust

Der Nutzer arbeitet oft mit **Unternehmen als erstem Objekt**, nicht mit einem bekannten Kontakt.

## Warum Standard-CRMs nicht passen

| Problem                                        | Auswirkung                                              |
| ---------------------------------------------- | ------------------------------------------------------- |
| Monatliche Kosten (monday, HubSpot, Pipedrive) | Wirtschaftlich unattraktiv für Solo-Nutzung             |
| Contact-first Datenmodell                      | Unternehmen ohne Kontakt schwer abbildbar               |
| Workflow passt nicht zu 100 %                  | Kompromisse im täglichen Prozess                        |
| Übermäßige Kontaktzentrierung                  | Recherche-Phase vor Kontaktfund nicht abbildbar         |
| Konfigurierbarkeit oft oberflächlich           | Custom Fields ohne echte Feldtypen, hardcoded Pipelines |

## Company-first Workflow

```
Unternehmen anlegen
    ↓
Bewertung / Recherchestatus setzen
    ↓
Optional: Ansprechpartner recherchieren und anlegen
    ↓
Outreach-Aktivitäten am Unternehmen (auch ohne Kontakt)
    ↓
Optional: Deal bei konkreter Verkaufschance
    ↓
Pipeline-Fortschritt (Company-Pipeline und/oder Deal-Pipeline)
```

**Kernregel:** Ein Unternehmen ist ein vollwertiger Lead. Kontakt und Deal sind Erweiterungen, keine Voraussetzungen.

## Kernobjekte

### Companies (Unternehmen)

Primäres Lead-Objekt. Enthält Systemfelder (Name, Website, Branche, …) und Custom Field Values. Kann in Company-Pipelines positioniert sein. Kann Activities, Tags und optional Contacts/Deals haben.

### Contacts (Kontakte)

Optionale Personen, die einem Unternehmen zugeordnet sind. Ein Unternehmen kann null, einen oder viele Kontakte haben. Kontakte sind nicht Voraussetzung für Pipeline-Fortschritt oder Activities.

### Deals (Verkaufschancen)

Optionale Verkaufschancen. Typischerweise einem Unternehmen zugeordnet, optional einem Kontakt. Entstehen, wenn eine konkrete Geschäftschance erkennbar ist — nicht bei jedem Lead.

### Pipelines

Konfigurierbare Prozessketten pro Entity-Typ (`company`, `deal`). Enthalten ordered Stages. Nicht hardcoded.

### Pipeline Stages

Phasen innerhalb einer Pipeline (z.B. „Rohlead", „Qualifiziert"). Mit Farbe, Sortierung, optional Won/Lost-Markierung.

### Custom Fields

Metadaten-definierte Felder pro Entity-Typ. Echte Feldtypen (text, select, date, …). Werte in separater Value-Tabelle.

### Custom Field Options

Optionen für select/multi_select Felder. Verwaltbar in Settings.

### Custom Field Values

Typgerecht gespeicherte Werte pro Entity-Instanz und Custom Field.

### Views

Gespeicherte Ansichtskonfiguration: sichtbare Felder, Filter, Sortierung, Gruppierung, Kanban-card-fields. System- und Custom Fields gemeinsam.

### Activities

Aktivitäten (Anruf, E-Mail, Notiz, Meeting, Follow-up) — primär am Unternehmen, optional am Kontakt oder Deal.

### Tags

Flexible Labels für Entities. Many-to-many über entity_tags.

### Workspaces

Mandanten-/Arbeitsbereich-Einheit. Isoliert alle CRM-Daten. Für Solo-Nutzung initial ein Workspace, technisch vorbereitet für Erweiterung.

### Profiles

Benutzerprofil, verknüpft mit Supabase Auth. Mitgliedschaft in Workspaces.

## Hauptmodule (langfristig)

| Modul                | Beschreibung                                     |
| -------------------- | ------------------------------------------------ |
| **Companies**        | Listen, Detail, Pipeline-Position, Custom Fields |
| **Company Views**    | Tabelle, Kanban — konfigurierbar                 |
| **Contacts**         | Optional, Unternehmenszuordnung                  |
| **Deals**            | Optional, Deal-Pipeline                          |
| **Activities**       | Timeline, Follow-ups, Notizen                    |
| **Settings**         | Pipelines, Stages, Custom Fields, Views, Tags    |
| **Auth & Workspace** | Login, Profil, Workspace-Kontext                 |

## Nicht-Ziele

- Kein Multi-Tenant-SaaS für externe Kunden (vorerst)
- Kein E-Mail-Client-Ersatz (Integration später optional)
- Kein Marketing-Automation-Hub
- Kein Contact-first CRM
- Kein „einfaches CRUD-Demo" mit hardcoded Feldern
- Keine Fake-Konfigurierbarkeit (UI suggeriert Config, Backend ist hardcoded)
- Kein Ersatz für Buchhaltung, Projektmanagement oder Zeiterfassung

## Langfristige Vision

Ein CRM-Betriebssystem für B2B-Akquise:

- Beliebige System- und Custom Fields in allen Views
- Beliebige Pipelines und Stages pro Entity-Typ
- Filter, Sort, Group aus View-Config
- Professionelle Settings-UX
- Saubere Supabase/Postgres-Basis mit RLS
- Hochwertige UI (separat spezifiziert)

## Erste Version / MVP-Grenze

MVP = **Company-Core mit metadata-driven Views**, nicht Full-CRM.

### Im MVP (Phasen 1–7, grob)

- Auth, Workspace, Profile
- Companies CRUD mit Systemfeldern
- Custom Fields (Kernfeldtypen)
- Company Table View (konfigurierbar)
- Company Kanban View (Pipeline aus DB)
- Settings: Pipelines, Stages, Custom Fields, Views

### Explizit nicht im MVP

- Contacts-Modul (Phase 8)
- Deals-Modul (Phase 9)
- Activities-Timeline (Phase 10)
- E-Mail-Integration
- Reporting/Dashboards
- Mobile App
- Multi-User-Kollaboration (beyond basic workspace)

### MVP-Akzeptanz (Produkt)

Ein Nutzer kann:

1. Sich anmelden
2. Unternehmen ohne Kontakt anlegen
3. Custom Fields definieren und befüllen
4. Unternehmen in konfigurierbarer Tabelle sehen und filtern
5. Unternehmen in Kanban nach Pipeline-Stages verschieben
6. Pipelines, Stages, Fields und Views in Settings verwalten

Ohne hardcoded Spalten, Stages oder Feldlisten im Frontend-Code.

## Explizite Produktregeln

1. **Unternehmen ohne Kontakt** — muss in allen Company-Views funktionieren
2. **Unternehmen ohne Deal** — normaler Zustand in frühen Pipeline-Phasen
3. **Kontakt-Recherche-Status** — Systemfeld/Konzept für „Kontakt bekannt / in Recherche / unbekannt"
4. **Deals entstehen spät** — nicht bei Lead-Erfassung erzwingen
5. **Konfiguration schlägt Code** — neue Pipeline-Phase = DB-Eintrag, nicht Deploy

## Operatives Vollständigkeits-Prinzip

Ein Unternehmen ist ein vollwertiger, operativ bearbeitbarer Lead, auch wenn:

- kein Contact-Record existiert (Entscheider noch unbekannt)
- kein Deal existiert (Verkaufschance noch nicht erkennbar)
- nur Website, Impressum-Telefon oder Impressum-Mail bekannt sind
- der Workflow noch in der Recherche- oder Bewertungsphase ist

Der typische Akquise-Einstieg bei Blumenthal Systems:

```
Unternehmen finden (LinkedIn, Liste, Empfehlung)
→ Unternehmen anlegen: Name + Website
→ contact_discovery_status = unknown
→ Bewertung: fit_score, pain_score, priority (Custom Fields)
→ Recherche starten: contact_discovery_status = researching
→ Outreach: Activity anlegen (Anruf, E-Mail) — auch ohne Contact
→ Follow-up: next_action_at setzen
→ Erst wenn Bedarf konkret: Deal anlegen
```

`name` allein + `contact_discovery_status` reicht für einen vollwertigen Lead-Record. Kein Pflichtfeld jenseits des Firmennamens.

## Akquise-Operative Felder

Details und System-Field-vs.-Custom-Field-Entscheidung: [docs/data-model.md](data-model.md) (Sektion „Akquise-Operative Felder").

**ADR:** [docs/adr/010-company-acquisition-operating-fields.md](adr/010-company-acquisition-operating-fields.md)
