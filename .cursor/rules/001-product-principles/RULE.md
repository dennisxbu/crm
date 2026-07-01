# Product Principles

Dieses Projekt ist ein **company-first CRM** für Blumenthal Systems (B2B-Akquise im DACH-Raum).

## Regeln

- **Companies** sind das primäre Lead-Objekt — nicht Contacts
- **Contacts** und **Deals** sind optional, nie Voraussetzung
- Keine kontaktzentrierte CRM-Logik erzwingen (kein „erst Contact anlegen")
- **Produktqualität vor schneller Demo** — kein Tutorial-CRUD
- Kein Uni-Projekt-Stil in Code oder Architektur
- Vor Implementierung: `docs/product-spec.md` lesen

## Nicht tun

- Contact-required bei Company Create
- Deal bei jedem Lead erzwingen
- Features bauen, die Standard-Contact-first-CRMs nachahmen ohne Spec-Bezug
