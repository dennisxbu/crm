# Produktprinzipien & Betriebsmodell — Blumenthal Systems CRM

> **Zweck dieses Dokuments.** Dies ist der **Nordstern** des Produkts. Alle anderen Docs
> beschreiben _was_ gebaut wird (Specs) und _warum_ Architektur-Entscheidungen fielen (ADRs).
> Dieses Dokument beschreibt das **Produktgefühl** und das **Betriebsmodell**, gegen das jedes
> Feature geprüft wird. Wenn eine Umsetzung technisch korrekt ist, aber sich hier „falsch" anfühlt,
> ist sie nicht fertig.
>
> Destilliert aus der Monday-CRM-Recherche (`docs/research/`) und **übersetzt** in das
> company-first-Modell dieses Repos. Monday wird als **Interaktions- und Betriebsmodell** studiert,
> **nicht** als Datenmodell kopiert.

---

## 1. Produktthese in einem Satz

Ein **company-first Akquise-Betriebssystem** mit **monday-artiger Konfigurierbarkeit als
Erstklassenwert** — nicht ein CRM mit „ein paar Custom Fields", sondern ein System, in dem der
Nutzer das Gefühl hat: _„Das ist mein Workflow, nicht ein Template."_

Konkret bedeutet „Konfigurierbarkeit als Erstklassenwert": **Fast jede Oberfläche ist vom Nutzer
umformbar, und diese Umformbarkeit ist Daten, kein Deploy.** Ein Prio-Dropdown in der
Leads-Tabelle, dieselben Firmen als Kanban nach Pipeline-Phase, ein neues Feld vom Typ „Rating",
eine gespeicherte gefilterte Ansicht „Meine heißen Leads" — das sind **keine Features, die einzeln
gebaut werden**, sondern Ausdrücke _desselben_ metadata-driven Fundaments.

---

## 2. Das „Summe der hunderten kleinen Anpassungen"-Prinzip

Der wahrgenommene Wert dieses CRM entsteht nicht aus großen Modulen, sondern aus **hunderten
kleiner Konfigurations-Affordances**, die zusammen das Gefühl „das gehört mir" erzeugen.

Beispiele (illustrativ, **nicht** als Feature-Backlog gemeint):

- „Ich will in der Leads-Tabelle sehen, wie wichtig ein Lead ist." → `select`-Custom-Field `priority` + in View-`columns` aufnehmen.
- „Ich will die Firmen lieber als Kanban nach Phase sehen." → neue `views`-Zeile mit `view_type=kanban`, keine neue UI.
- „Ich will eine Telefonnummer-Spalte, die klickbar ist." → `phone`-Field-Type-Handler rendert `tel:`-Link — überall.
- „Ich will nur offene Leads sehen." → gespeicherter Filter in `views.config.filters` auf `stage_type=open`.

**Konsequenz für jede Umsetzung:** Der Wunsch nach _einer_ Anpassung ist immer ein Wunsch nach der
_Fähigkeit_, solche Anpassungen zu machen. Wer die Instanz hardcodet, zerstört den Kernwert des
Produkts — auch wenn die Instanz „funktioniert".

---

## 3. Das Betriebsmodell (von monday gelernt, semantisch angepasst)

Monday ist stark, weil es **operative Arbeit sichtbar und steuerbar** macht. Übersetzt auf
company-first:

| Betriebsschritt                    | monday-Vorbild                                                     | Umsetzung hier                                                                                | Phase  |
| ---------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------ |
| **Schnelle, saubere Erfassung**    | Item Creation Form (interne Pflichtfelder, Reihenfolge)            | „Create Company"-Flow, nur `name` erzwungen, Rest konfigurierbar                              | 3      |
| **Record als Arbeitsfläche**       | Entity Board mit lokalem Kontext + reservierter Kommunikationszone | Company-Detail: Systemfelder + Custom Fields generisch + reservierte Timeline-Zone (Phase 10) | 3 / 10 |
| **Operative Felder auto-gepflegt** | „last touched" per Automation                                      | `last_activity_at`, `last_contacted_at`, `next_action_at` als System Fields                   | 3 / 10 |
| **Beliebige Sichten**              | Views, Spalten-Gefühl, Kanban                                      | `views` (table/kanban) aus DB-Config, Field-Registry rendert generisch                        | 5 / 6  |
| **Prozess sichtbar**               | Pipeline View + Deal Stages Widget (Verweildauer, Reopen)          | `pipelines` → `pipeline_stages` → `entity_pipeline_positions` (`entered_at`)                  | 6      |
| **Statussicherheit**               | Conditional status changes                                         | Stage-Wechsel-Bedingungen (z.B. „won" erst wenn Wert gesetzt)                                 | 7+     |
| **Kommunikation am Objekt**        | Emails & Activities, manuelle Timeline-Zuordnung                   | Activities primär an Company, optional Multi-Association an Contact/Deal                      | 10     |
| **KI an der richtigen Stelle**     | AI blocks, Timeline Summary, Autofill                              | KI dockt an Felder/Timeline/Follow-up an — **keine** Chatbox neben dem CRM                    | später |

**Kernidee:** Nicht die feste Objektfolge Lead→Contact→Account→Deal übernehmen, sondern die Art,
wie monday **Kontext, Beziehungen und Aktionen direkt im Arbeitsobjekt zusammenzieht**.

---

## 4. Was von monday NICHT übernommen wird

Diese Elemente sind in monday sinnvoll, widersprechen aber diesem Produkt:

- **Contact-first / Lead-wird-Contact-Fluss.** Hier bleibt die Company immer das Basisobjekt;
  Contact und Deal sind zusätzliche Layer. Übersetzung: _nicht_ „Lead wird Contact", sondern
  „Company erreicht einen Reifegrad, ab dem Contact/Deal sinnvoll werden".
- **Festes Vier-Board-Denken** (Leads/Contacts/Accounts/Deals als starre CRM-Objekte).
- **Rep-Leaderboards, Quotes & Invoices, Products Widget, Revenue Intelligence als frühe Priorität.**
  Nicht schlecht — aber Post-MVP. MVP löst zuerst Company-Core, Custom Fields, Views, Settings sauber.

---

## 5. Der Litmus-Test für „on-vision"

Ein Feature ist **on-vision**, wenn alle vier Punkte zutreffen:

1. **Company bleibt vollwertig ohne Contact und ohne Deal.** Kein Flow erzwingt sie.
2. **Konfiguration schlägt Code.** Was der Nutzer sehen/anordnen/filtern will, ist Daten
   (`custom_fields`, `pipeline_stages`, `views.config`) — nicht Frontend-Konstanten.
3. **Ein Mechanismus, nicht eine Instanz.** Die Umsetzung funktioniert für den nächsten ähnlichen
   Wunsch automatisch mit (neues Feld/Stage/View = Datensatz, kein Deploy).
4. **Generisch bewiesen.** Das Feature fließt durch Field-Registry / View-Config und erscheint dadurch
   konsistent in Detail, Table, Kanban-Karte, Filter, Settings — nicht per Sonderfall pro Feldname.

Fällt ein Punkt durch, ist das Feature laut `docs/definitions-of-done.md` **nicht fertig**, egal wie
gut die UI aussieht.

---

## 6. Verweise

- Produktscope & Nicht-Ziele: `docs/product-spec.md`
- Feldtypen & Field Type Contract: `docs/custom-fields.md`, `docs/adr/009-field-type-contract.md`
- Views & Pipelines aus Config: `docs/pipelines-and-views.md`, `docs/adr/006-pipelines-views-configuration.md`
- Akzeptanzkriterien: `docs/definitions-of-done.md`
- Quelle der Betriebsmodell-Analyse: `docs/research/monday-feature-research.pdf`
