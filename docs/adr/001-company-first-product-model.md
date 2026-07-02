# ADR-001: Company-First Product Model

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Product foundation

## Context

Standard CRMs (HubSpot, Pipedrive, monday) are contact-centric and expensive. Blumenthal Systems acquires leads as **companies first** — often before a contact person is known. The product must support full pipeline work on companies without contacts or deals.

## Decision

1. **Companies** are the primary lead object
2. **Contacts** and **Deals** are optional extensions, never prerequisites
3. **Activities** attach primarily to companies
4. **`contact_discovery_status`** is a first-class workflow field on companies
5. UI and data flows must not require contact or deal creation

## Consequences

### Positive

- Matches real DACH B2B acquisition workflow
- Differentiates from off-the-shelf CRMs

### Negative / trade-offs

- Custom UX required — no default CRM templates fit

## Alternatives considered

| Option                     | Pro               | Contra                      | Outcome      |
| -------------------------- | ----------------- | --------------------------- | ------------ |
| Contact-first like HubSpot | Familiar patterns | Breaks acquisition workflow | Rejected     |
| Company-first (this)       | Fits use case     | More custom product work    | **Accepted** |

## Detail documentation

- [docs/product-spec.md](../product-spec.md)
- [docs/glossary.md](../glossary.md)
