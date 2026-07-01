# Glossar

Fachbegriffe des Blumenthal Systems CRM — einheitliche Sprache in Docs, Code und UI.

---

## Company

**Unternehmen.** Primäres Lead-Objekt im CRM. Ein Company-Record repräsentiert eine Zielorganisation in der Akquise — unabhängig davon, ob bereits ein Ansprechpartner oder eine Verkaufschance existiert.

Englisch im Code/DB: `companies`.

---

## Contact

**Kontakt / Ansprechpartner.** Optionale Person, die einem Unternehmen zugeordnet ist. Kein Pflichtobjekt für Leads oder Pipeline-Fortschritt.

Englisch: `contacts`.

---

## Deal

**Verkaufschance.** Optionales Objekt für eine konkrete Geschäftsmöglichkeit, typischerweise an ein Unternehmen gebunden. Entsteht später im Prozess — nicht bei jedem Lead.

Englisch: `deals`.

---

## Pipeline

Konfigurierbare Prozesskette für einen Entity-Typ (`company` oder `deal`). Enthält geordnete Stages. Steuert Kanban-Spalten und Fortschrittslogik.

Beispiel: „Company Akquise" mit Stages von Rohlead bis Kunde.

Englisch: `pipelines`.

---

## Stage

**Pipeline-Phase.** Einzelner Schritt innerhalb einer Pipeline. Hat Name, Farbe, Sortierung und optional Typ (`open`, `won`, `lost`). Entspricht einer Kanban-Spalte.

Englisch: `pipeline_stages`.

---

## View

Gespeicherte **Ansichtskonfiguration** für eine Entity — Tabelle oder Kanban. Definiert sichtbare Felder, Filter, Sortierung und (bei Kanban) Kartenfelder. Nicht mit „Screen" oder „Page" verwechseln: View = gespeicherte Config.

Englisch: `views`.

---

## Custom Field

Vom Nutzer in Settings definierbares Feld mit explizitem **Feldtyp** (text, select, date, …). Werte werden typgerecht in `custom_field_values` gespeichert. Kern des metadata-driven Systems.

---

## System Field

Fest im Datenbankschema verankertes Feld auf einer Entity-Tabelle (z.B. `companies.name`, `companies.website`). Nicht in Settings anlegbar, aber in Views referenzierbar (`system:name`).

---

## Entity

Generischer Oberbegriff für CRM-Objekttypen: Company, Contact, Deal, … Custom Fields, Pipelines und Views sind oft pro `entity_type` scoped.

---

## Workspace

Isolierte Arbeitsumgebung. Alle CRM-Daten gehören zu einem Workspace. Technische Basis für Mandantentrennung — bei Solo-Nutzung typischerweise ein Workspace pro Nutzer.

Englisch: `workspaces`.

---

## Activity

Aktivität oder Notiz im CRM: Anruf, E-Mail, Meeting, Aufgabe, Freitext-Notiz. Primär an Unternehmen gebunden, optional an Contact oder Deal.

Englisch: `activities`.

---

## Metadata-driven

Architekturprinzip: Konfiguration (Felder, Pipelines, Views) wird in der **Datenbank** gespeichert und zur Laufzeit interpretiert — nicht als hardcoded Listen im Frontend-Code.

---

## Company-first

Produktprinzip: **Unternehmen** ist das primäre Lead-Objekt. Kontakte und Deals sind Erweiterungen. Workflow beginnt beim Unternehmen, nicht beim Kontakt.

Gegenteil: Contact-first (klassische CRMs).

---

## Contact Discovery Status

Systemfeld an Company (`contact_discovery_status`). Beschreibt, ob und in welchem Stadium die Ansprechpartner-Recherche ist.

Typische Werte:

| Wert | Bedeutung |
|------|-----------|
| `unknown` | Noch kein Kontakt bekannt, Recherche nicht gestartet |
| `researching` | Recherche läuft |
| `found` | Ansprechpartner identifiziert (Contact kann angelegt werden) |
| `not_applicable` | Kein Contact nötig (z.B. Impressum-Mail reicht) |

---

## Lifecycle Status

Optionaler System-Status für die generelle Einordnung eines Unternehmens über den Pipeline-Kontext hinaus (z.B. `lead`, `prospect`, `customer`, `disqualified`). Unterscheidet sich von Pipeline-Stage — genaue Nutzung produktseitig in Phase 3+ festlegen.

Englisch: `lifecycle_status`.

---

## field_ref

Referenzformat für Felder in View-Config:

- `system:{column_name}` — System Field
- `custom:{uuid}` — Custom Field

---

## Seed

Initiale **Daten** (nicht Code) bei Workspace-Erstellung — z.B. Default-Pipeline mit Stages. Vom Nutzer danach editierbar. Kein Hardcoding im Frontend.

---

## RLS (Row Level Security)

Postgres-Mechanismus für zeilenbasierte Zugriffskontrolle. Stellt sicher, dass Nutzer nur Daten ihres Workspace sehen und ändern können.

---

## Definition of Done

Checkliste in `docs/definitions-of-done.md`. Modul gilt erst als fertig, wenn alle Kriterien erfüllt sind.
