# ADR-010: Company Akquise-Operative Felder — System Fields vs. Default Custom Fields

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Foundation Hardening vor Phase 2

## Context

Das Blumenthal-Systems-Akquise-Workflow-Modell erfordert mehr operative Felder als das generische CRM-Datenmodell initial definiert. Folgende Felder werden für den typischen Workflow gebraucht:

`lead_source`, `lead_source_detail`, `research_status`, `contact_discovery_status`, `priority`, `fit_score`, `pain_score`, `next_action_at`, `last_activity_at`, `last_contacted_at`, `call_attempt_count`, `last_call_outcome`, `disqualification_reason`, `owner_id`, `archived_at`

Die Frage ist: welche davon gehören als **System Fields** in die `companies`-Tabelle, und welche als **Default Custom Fields** per Workspace-Seed?

## Decision

### Entscheidungsregel

> **System Field:** Wird für Kernlogik, automatisierte Updates, RLS-Erweiterungen, Realtime-Abfragen oder Pipeline-Logik fast immer benötigt. Kann nicht wegkonfiguriert werden.
>
> **Default Custom Field:** Sinnvoller Akquise-Standard, aber workflow-spezifisch, umbenennbar, entfernbar und erweiterbar ohne Schema-Migration.

### System Fields (in `companies`-Tabelle)

| Feld                       | Typ                         | Begründung                                          |
| -------------------------- | --------------------------- | --------------------------------------------------- |
| `contact_discovery_status` | text enum                   | Kern-Workflow; häufig gefiltert; Pipeline-Logik     |
| `lifecycle_status`         | text enum nullable          | Lead-Einordnung jenseits Pipeline; häufig gefiltert |
| `owner_id`                 | uuid FK → profiles nullable | Zuordnung; RLS-Erweiterung möglich                  |
| `next_action_at`           | timestamptz nullable        | Follow-up; relevant für Reminders und Task-Logik    |
| `last_activity_at`         | timestamptz nullable        | Automatisch bei Activity-Write; Stale-Lead-Filter   |
| `last_contacted_at`        | timestamptz nullable        | Automatisch bei Outreach-Activity                   |
| `archived_at`              | timestamptz nullable        | Soft-Delete; Filter „nur aktive Leads"              |

### Default Custom Fields (Workspace-Seed)

| Feld                      | field_type | Begründung                                               |
| ------------------------- | ---------- | -------------------------------------------------------- |
| `lead_source`             | select     | Workflow-spezifisch (LinkedIn, Liste, Empfehlung, …)     |
| `lead_source_detail`      | text       | Ergänzung zu lead_source                                 |
| `research_status`         | select     | Detaillierter als contact_discovery_status; variiert     |
| `priority`                | select     | Sehr individuell (Hoch/Mittel/Niedrig oder eigene Skala) |
| `fit_score`               | rating     | Subjektiv; Person/Workflow-abhängig                      |
| `pain_score`              | rating     | Subjektiv                                                |
| `call_attempt_count`      | number     | Outreach-Tracking; nicht universell benötigt             |
| `last_call_outcome`       | select     | Sehr individuell (Nicht erreicht, VM, Ablehnung, …)      |
| `disqualification_reason` | select     | Nur relevant wenn disqualifiziert                        |

### Operatives Vollständigkeits-Prinzip

Ein Unternehmen ist ein vollwertiger, operativ bearbeitbarer Lead mit nur `name` + `contact_discovery_status`. Kein Contact, kein Deal, kein ausgefülltes Custom Field ist eine Pflichtvoraussetzung für das Bearbeiten eines Leads.

## Consequences

### Positive

- Kern-System-Fields indizierbar, typsicher, filterbar ohne EAV-Join
- Operative Felder ohne Schema-Migration in Settings editierbar
- Klare Trennung: Automatisch aktualisierte Felder = System; Manuell eingepflegte Einschätzungen = Custom

### Negative

- System Fields wie `last_activity_at`, `last_contacted_at` erfordern DB-Trigger oder App-Logik für automatische Updates (Phase 3+)
- Default Custom Fields müssen als Seed angelegt werden — wenn gelöscht, fehlen sie (akzeptabel, da Nutzer weiß was er tut)

## Detail-Dokumentation

`docs/data-model.md` — Sektion „Akquise-Operative Felder"  
`docs/product-spec.md` — Sektion „Operatives Vollständigkeits-Prinzip"
