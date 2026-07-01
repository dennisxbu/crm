# Definition of Done

Qualitätskriterien pro Modul. Ein Feature gilt **nicht als fertig**, wenn Kriterien unerfüllt sind — auch wenn UI „funktioniert".

---

## Custom Fields

Custom Fields gelten erst als fertig, wenn:

- [ ] Feld in Settings erstellt werden kann
- [ ] Feldtyp gewählt werden kann
- [ ] Feldtyp korrekt validiert wird (client + persistiert korrekt)
- [ ] Feldwert typgerecht gespeichert wird (richtige value-Spalte)
- [ ] Feld in Detailansicht funktioniert (Anzeige + Edit)
- [ ] Feld in Tabellenansicht angezeigt werden kann (wenn in View config)
- [ ] Feld in Kanban-Karte angezeigt werden kann (wenn in card_fields)
- [ ] Feld filterbar ist, soweit laut field_type sinnvoll
- [ ] Feld sortierbar ist, soweit laut field_type sinnvoll
- [ ] Select/Multi-Select Optionen in Settings verwaltbar sind
- [ ] Bestehende Werte bei Option-Label-Änderungen nicht zerstört werden
- [ ] Feld-Löschung behandelt bestehende Werte definiert (soft delete / warnen)
- [ ] Keine hardcoded Spezialfälle pro Feldname im Code
- [ ] Rendering läuft über Field Type Handler Registry

---

## Pipelines

Pipelines gelten erst als fertig, wenn:

- [ ] Pipeline in Settings erstellt werden kann
- [ ] Pipeline umbenannt werden kann
- [ ] Entity-Typ (`company`, `deal`) unterstützt und gespeichert wird
- [ ] Phasen (Stages) erstellt werden können
- [ ] Phasen sortiert werden können (Reorder)
- [ ] Phasenfarbe gesetzt werden kann
- [ ] Won/Lost-Status (`stage_type`) setzbar ist
- [ ] Kanban-Spalten aus `pipeline_stages` kommen — nicht aus Code
- [ ] Drag & Drop Stage und Order in `entity_pipeline_positions` aktualisiert
- [ ] `entered_at` bei Stage-Wechsel aktualisiert wird
- [ ] Nichts an Pipeline-Struktur ist hardcoded (Seed ist ok, muss editierbar sein)
- [ ] Default Pipeline pro Entity-Typ konfigurierbar

---

## Views

Views gelten erst als fertig, wenn:

- [ ] Ansicht in Settings gespeichert werden kann
- [ ] Ansicht geladen und gewechselt werden kann
- [ ] Sichtbare Felder (columns / card_fields) konfigurierbar sind
- [ ] Systemfelder und Custom Fields gemeinsam in einer View funktionieren
- [ ] Filter speicherbar und beim Laden angewendet werden
- [ ] Sortierung speicherbar und beim Laden angewendet werden
- [ ] Kanban-`card_fields` speicherbar sind
- [ ] Default-Ansicht pro entity_type + view_type setzbar ist
- [ ] View-Config aus DB — keine hardcoded Spaltenlisten im Frontend
- [ ] Ungültige field_ref (gelöschtes Field) definiert behandelt wird

---

## Companies

Companies gelten erst als fertig, wenn:

- [ ] Company ohne Kontakt angelegt werden kann
- [ ] Company ohne Deal angelegt werden kann
- [ ] Pflicht-Systemfelder validiert werden
- [ ] `contact_discovery_status` setzbar und filterbar ist
- [ ] Company in Workspace isoliert (RLS)
- [ ] Company in Pipeline positionierbar (wenn Phase 6+)
- [ ] Custom Fields am Company nutzbar (wenn Phase 4+)
- [ ] Company in Table und Kanban erscheint (wenn Phase 5/6+)
- [ ] Löschen/archivieren definiertes Verhalten hat
- [ ] Kein erzwungener Contact oder Deal bei Create

---

## Contacts

Contacts gelten erst als fertig, wenn:

- [ ] Contact optional an Company anlegbar
- [ ] Company ohne Contact unverändert voll nutzbar bleibt
- [ ] Primary Contact max. einer pro Company
- [ ] Contact editierbar/löschbar
- [ ] RLS workspace-scoped
- [ ] Contact erscheint am Company Detail — nicht als Einstiegspflicht

---

## Deals

Deals gelten erst als fertig, wenn:

- [ ] Deal optional — nicht bei Company-Create erforderlich
- [ ] Deal an Company gebunden
- [ ] Contact am Deal optional
- [ ] Deal in Deal-Pipeline positionierbar
- [ ] Deal-Wert und Close Date optional
- [ ] Won/Lost über Pipeline Stage abbildbar
- [ ] RLS workspace-scoped

---

## Activities

Activities gelten erst als fertig, wenn:

- [ ] Activity direkt an Company anlegbar (ohne Contact)
- [ ] Activity Types unterscheidbar (note, call, email, meeting, task)
- [ ] Timeline am Company Detail chronologisch
- [ ] Tasks mit due_at und completed_at
- [ ] Optional: Activity an Contact/Deal
- [ ] RLS workspace-scoped
- [ ] Erstellender User (`created_by`) gespeichert

---

## Settings

Settings gelten erst als fertig, wenn:

- [ ] Navigation zu Pipelines, Custom Fields, Views klar erreichbar
- [ ] CRUD für alle Config-Entitäten ohne SQL/Dashboard
- [ ] Änderungen sofort in App-Ansichten wirksam (nach Reload wenn nötig — ideal live)
- [ ] Destructive Actions bestätigen (Stage löschen, Field löschen)
- [ ] Keine Fake-Settings (Button ohne Backend)
- [ ] Empty States professionell (nicht „TODO")
- [ ] Fehler feedback an Nutzer (Validation, RLS deny)

---

## Supabase / RLS

Supabase/RLS gilt erst als fertig, wenn:

- [ ] Alle CRM-Tabellen RLS enabled
- [ ] Policies für CRUD pro Tabelle existieren
- [ ] Cross-Workspace Zugriff getestet unmöglich
- [ ] Kein Service Role Key im Frontend
- [ ] Migrationen reproduzierbar (`supabase db reset` ok)
- [ ] Auth.uid() in Policies korrekt
- [ ] Integrationstest: User A sieht nicht User B Daten

---

## UI (später, nach UX-Spezifikation)

UI gilt erst als fertig, wenn:

- [ ] Entspricht ui-ux-brief-for-claude.md Richtung
- [ ] Keine Bootstrap-Default-Optik unverändert
- [ ] Keine Uni-Projekt-Tabellen
- [ ] Empty States designed (nicht leere `<div>`)
- [ ] Settings wirken wie SaaS-Produkt, nicht Admin-Panel von 2010
- [ ] Responsive Minimum (Desktop-first ok für MVP)
- [ ] Loading und Error States vorhanden
- [ ] Typografie und Spacing konsistent
- [ ] Kanban und Table gleichwertig poliert

---

## Global: Kein Merge wenn

- Hardcoded Pipeline-Stages im Source
- Hardcoded Table columns
- Custom Field als plain string ohne Typ
- Feature gegen company-first Prinzip
- Halbes Feature mit Dummy-Button
- Docs widersprechen Implementierung und Docs nicht aktualisiert
