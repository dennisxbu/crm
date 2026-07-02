# ADR-000: Record Architecture Decisions

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 0–1 foundation, multi-AI development (Cursor, Claude Code, Codex)

## Context

This CRM is a long-lived private product with metadata-driven architecture, phased delivery, and multiple AI coding tools. We need durable records of _why_ choices were made — not only _what_ is in `docs/product-spec.md` or `docs/data-model.md`.

ADRs provide traceability for future work and prevent agents from re-litigating settled decisions each session.

## Decision

1. **Location:** `docs/adr/`
2. **Naming:** `NNN-short-slug.md` — numbers are never reused
3. **Index:** `docs/adr/README.md` lists every ADR with status and date
4. **Template:** New ADRs start from `docs/adr/template.md`
5. **Status lifecycle:** Accepted | Proposed | Superseded | Deprecated
6. **Authority:** Accepted ADRs override informal chat decisions. Detailed behaviour stays in `docs/*.md`; ADRs capture binding technical/product architecture choices
7. **When to update:** Direction change → new ADR or supersede; clarification only → Changelog section in existing ADR
8. **Agents:** `.cursor/rules/` and `AGENTS.md` reference ADRs; update rules when stack changes

## Consequences

### Positive

- Survives agent context resets and tool switches (Cursor ↔ Claude ↔ Codex)
- PR-reviewable architecture history
- Clear supersession without deleting history

### Negative / trade-offs

- Maintenance overhead — mitigated by short ADRs and existing detailed specs

## Alternatives considered

| Option              | Pro                       | Contra                                             | Outcome                     |
| ------------------- | ------------------------- | -------------------------------------------------- | --------------------------- |
| Only Cursor rules   | Fast                      | Mixes how/why; invisible to non-Cursor tools       | Rejected                    |
| Only long docs/     | Rich detail               | Hard to find decisions; agents skim wrong sections | Rejected — keep docs + ADRs |
| ADRs in repo (this) | Versioned, agent-readable | Must stay in sync with code                        | **Accepted**                |

## Related ADRs

- All ADRs 001–006 reference this process

## Follow-up

- Update README project status when phase changes
- Re-evaluate if team grows beyond solo dev
