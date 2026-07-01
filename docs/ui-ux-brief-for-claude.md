# UI/UX Brief für Claude

> **Hinweis:** Dieses Dokument ist ein Briefing für eine separate UI/UX-Spezifikationsphase mit Claude. Es enthält **keine visuelle Implementierung** und keine finalen Mockups. Ziel ist, später hochwertige Screens zu designen, die zur Produktarchitektur passen.

---

## Produktkontext

Privates B2B-Akquise-CRM für **Blumenthal Systems** — Solo-Beratung für Workflow-Automatisierung und KI-Prozesse, Zielkunden: Personalberatungen und Headhunter im DACH-Raum.

**Company-first:** Unternehmen sind das primäre Objekt. Kontakte und Deals sind optional. Viele Leads existieren zuerst nur als Firma mit Website — ohne bekannten Ansprechpartner.

**Metadata-driven:** Pipelines, Stages, Custom Fields und Views kommen aus Konfiguration. UI muss flexibel Felder rendern, nicht fest verdrahtete Spalten.

Technische Basis: React + Supabase (perspektivisch). Architektur-Docs: `docs/architecture.md`, `docs/custom-fields.md`, `docs/pipelines-and-views.md`.

---

## Zielgefühl des UI

- **Professionelles B2B-SaaS** — ruhig, confident, nicht billig wirkend
- **Werkzeug für tägliche Akquise** — schnell scannable, wenig Reibung
- **Konfigurierbarkeit sichtbar** — monday-inspiriert: User spürt, dass das System „ihr" Workflow ist
- **Pipeline-Klarheit** — pipedrive-inspiriert: Kanban sofort verständlich
- **Tiefe ohne HubSpot-Overwhelm** — Settings vorhanden, aber nicht 400 Menüpunkte

Emotional: *„Das ist mein System, nicht ein Template."*

---

## Was vermieden werden muss

| Vermeiden | Warum |
|-----------|-------|
| Uni-Projekt-Optik | Generic Tables, System-Fonts ungestylt, misaligned Forms |
| Bootstrap-Default | Erkennbarer Template-Look |
| Überladenes HubSpot-Gefühl | Zu viele Sidebars, Tabs, Marketing-Banner |
| Contact-first Layout | Contact nicht als Pflicht-Schritt im Create-Flow |
| Fake-Konfigurierbarkeit | Settings-UI ohne echte Wirkung |
| Spielzeuglook | Bunte Gradients, übertriebene Illustrationen |
| Admin-Panel 2010 | Graue Tabellen, winzige Checkboxen, kein Whitespace |
| CRUD ohne Kontext | Nackte Formulare ohne Pipeline/Status-Kontext |

---

## Gewünschte Designrichtung

### Visuell

- Viel **Weißraum**
- **Klare Typografie** — eine Display/Sans-Kombination, gut lesbare Tabellengrößen
- **Dezente Borders** — 1px, light gray, nicht schwer
- **Gedämpfte Farbpalette** — Akzent für Primary Actions und Stage-Farben
- Stage-Farben aus DB — UI muss Farben aus Config anzeigen, nicht fest codieren

### Komponenten-Qualität

- **Professionelle Tabellen** — sticky header, row hover, column resize (später), sort indicators
- **Hochwertige Empty States** — kurzer Text + eine klare Action („Erstes Unternehmen anlegen")
- **Starke Settings-UX** — klare Sektionen, Reorder per Drag, Inline Edit wo sinnvoll
- **Kanban** — klare Spalten, lesbare Karten, Drag-Affordance
- **Field Renderers** — einheitlich in Detail, Table, Kanban Card

### Inspiration (nicht kopieren)

| Produkt | Was übernehmen |
|---------|----------------|
| **monday** | Konfigurierbarkeit, Views, Spalten-Gefühl |
| **Pipedrive** | Pipeline/Kanban-Klarheit, Deal-Stage-Simplicity |
| **HubSpot** | Tiefe in Detail-Views — selektiv, nicht das UI-Chaos |

---

## Screens — später zu gestalten

### Core

1. **Login / Register** — minimal, professionell
2. **App Shell** — Sidebar, Workspace-Kontext, Navigation (Companies, später Contacts/Deals, Settings)
3. **Companies — Table View** — konfigurierbare Spalten, Filter-Bar, View-Switcher
4. **Companies — Kanban View** — Pipeline-Spalten, Karten mit card_fields
5. **Company Detail** — System Fields + Custom Fields, Pipeline-Status, später Timeline
6. **Company Create/Edit** — kein erzwungener Contact; contact_discovery_status prominent

### Settings (hohe Priorität)

7. **Pipelines List + Edit** — Stages reorder, Farben, Won/Lost
8. **Custom Fields List + Edit** — Typ-Auswahl, Optionen für Select
9. **Views List + Edit** — Spalten picker, Filter builder, card_fields für Kanban
10. **Tags** (optional MVP)

### Später (Phase 8+)

11. Contacts am Company Detail
12. Deals List/Kanban/Detail
13. Activities Timeline

---

## Company-first Workflow in der UI

### Create Flow

```
Unternehmen anlegen
→ Name + Website (+ optional weitere System Fields)
→ contact_discovery_status (default: unknown)
→ Speichern → Company existiert als vollwertiger Lead
→ Optional: in Pipeline positionieren
```

**Nicht:** „Zuerst Kontakt anlegen" oder Wizard mit 5 Pflichtschritten.

### Detail-Ansicht

- Company Header: Name, Website, Stage Badge
- Contact Discovery Status sichtbar (Badge oder Field)
- Custom Fields Block — generisch gerendert
- Contacts Sektion: Empty State „Noch kein Ansprechpartner" + Recherche-Action — nicht hidden
- Deals Sektion: optional, später

### Kanban

- Karten zeigen **card_fields** aus View — typisch Website, Status, Custom Score
- Karte ohne Contact vollständig — kein „Contact fehlt" Error State

---

## Settings als Produktbereich

Settings sind **kein Anhang** — sie sind, wo das CRM zum persönlichen Werkzeug wird.

Anforderungen:

- Gleiche visuelle Qualität wie Core Screens
- Drag & Drop für Stage-Reihenfolge und View-Spalten
- Field Type Picker mit Icons/Labels — User versteht Unterschied text vs. select vs. rating
- Preview wie Feld in Detail/Table aussehen wird (ideal)
- Bestätigung bei destruktiven Aktionen

---

## Metadata-driven UI-Anforderungen

Designer und Frontend müssen planen für:

- **Variable Spaltenanzahl** in Tables
- **Variable Karteninhalte** in Kanban
- **17 Field Types** — unterschiedliche Inputs (später gestaffelt)
- **Filter Builder** — dynamisch nach Field Type
- **Virtual Fields** — z.B. `pipeline_stage` als Spalte

Layout muss **flexibel** sein, nicht für 5 feste Spalten designed.

---

## Responsive / Platform

- **Desktop-first** für MVP — Akquise am Rechner
- Tablet: brauchbar
- Mobile: nicht MVP-kritisch — aber nicht kaputt

---

## Accessibility (Minimum)

- Fokus-States sichtbar
- Kontrast WCAG AA anstreben
- Form Labels für alle Fields
- Kanban DnD alternative (Stage dropdown) — ideal für a11y

---

## Deliverables erwartet von UX-Phase

1. Design System Grundlagen (Farben, Type, Spacing, Radius)
2. Komponenten-Inventar (Button, Input, Table, Kanban Card, Badge, …)
3. Key Screens (Wireframe → High-Fidelity) für Liste oben
4. Field Type Input/Display Patterns
5. Empty/Loading/Error State Patterns
6. Settings Flows

---

## Referenz-Dokumente

- `docs/product-spec.md` — Produktlogik
- `docs/custom-fields.md` — Feldtypen
- `docs/pipelines-and-views.md` — Kanban/Table Config
- `docs/definitions-of-done.md` — wann UI „fertig"

---

## Explizit out of scope für UX-Phase

- Backend-Implementierung
- Supabase Migrationen
- Echte Datenanbindung
- Marketing-Website / Landing Page
