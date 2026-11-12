# Architecture Decision Records (ADR)

> **TechySheikhpura '26** — Permanent Technical Decisions & Design Rationale.

[![Decisions: 6 ADRs](https://img.shields.io/badge/ADRs-6_Recorded-3178C6?style=for-the-badge)](DECISIONS.md)
[![Architecture: SPA](https://img.shields.io/badge/Type-Single_Page_App-61DAFB?style=for-the-badge)](ARCHITECTURE.md)

---

## ADR Index

| ADR ID | Decision Title | Status | Date |
|---|---|---|---|
| **ADR-001** | Vite + React 19 Client SPA over Server Framework | `ACCEPTED` | 2026-11-10 |
| **ADR-002** | Adoption of TechVerse Dark Void & Futuristic Font System (`#020003`, Oxanium, Plus Jakarta Sans) | `ACCEPTED` | 2026-11-10 |
| **ADR-003** | Authentic Administrative Block Photography as Hero Backdrop | `ACCEPTED` | 2026-11-10 |
| **ADR-004** | Client-Side Holographic QR Badge & Dynamic Confetti Engine | `ACCEPTED` | 2026-11-10 |
| **ADR-005** | Elimination of Google Maps & Complex Contact Form | `ACCEPTED` | 2026-11-10 |
| **ADR-006** | In-Memory Data Model with LocalStorage Ticket Persistence | `ACCEPTED` | 2026-11-10 |

---

### ADR-001: Vite + React 19 Client SPA over Server Framework

- **Context:** The college fest requires an ultra-responsive website that loads rapidly on mobile 4G networks without cold starts or server latency.
- **Decision:** Build as a single-page application using Vite 8, React 19, and strict TypeScript.
- **Consequences:**
  - *Pros:* Rapid initial load, zero backend hosting overhead, instant HMR during development.
  - *Cons:* Dynamic ticket generation relies on client-side state rather than remote databases (mitigated via LocalStorage persistence).

---

### ADR-002: Adoption of TechVerse 1:1 Aesthetic Identity

- **Context:** The fest identity targets a seamless 1:1 aesthetic alignment with `https://techverse-dce.me/` customized for GEC Sheikhpura.
- **Decision:** Use `#020003` deep midnight void, Google Fonts `Oxanium`, `Space Grotesk`, `Plus Jakarta Sans`, and `Barlow Condensed`, obsidian glass cards, fuchsia/magenta ambient radiance, and custom AI twilight artwork in the footer across every view, modal, and 404 route.
- **Consequences:**
  - *Pros:* Unified visual language with zero jarring cyan/navy remnants.
  - *Cons:* Requires disciplined token usage across dialogs and utility routes.

---

### ADR-003: Authentic Administrative Block Photography as Hero Backdrop

- **Context:** Students and visitors should immediately recognize Government Engineering College, Sheikhpura upon landing.
- **Decision:** Use the authentic photograph of GEC Sheikhpura Administrative Block (`/gecs-campus.jpg`) as the hero backdrop layered with dark radial gradient overlays.
- **Consequences:**
  - *Pros:* Strong institutional pride and authenticity.
  - *Cons:* Requires `brightness-[0.32]` and `contrast-125` filtering so white foreground typography retains high contrast.

---

### ADR-004: Client-Side Holographic QR Badge & Dynamic Confetti Engine

- **Context:** Students booking fest passes expect immediate visual confirmation that works offline without depending on external QR APIs.
- **Decision:** Implement `PassBookingModal.tsx` with `canvas-confetti` and a deterministic inline SVG QR code matrix rendered from each registration payload.
- **Consequences:**
  - *Pros:* Instant offline QR rendering and celebratory UX without external network failures.
  - *Cons:* Lightweight QR matrix visual representation rather than a server-signed cryptographic token.

---

### ADR-005: Elimination of Google Maps & Complex Contact Form

- **Context:** User directive requested removing the embedded map section and replacing the footer cleanly with the TechVerse crowd banner.
- **Decision:** Omit Google Maps iframe and complex contact forms in favor of the panoramic crowd footer with direct coordinator `tel:` links.
- **Consequences:**
  - *Pros:* Eliminates heavy third-party map embeds and maintains exact visual parity.
  - *Cons:* Visitors use campus coordinates/address text or direct phone links.

---

### ADR-006: In-Memory Data Model with LocalStorage Ticket Persistence

- **Context:** Events, pass tiers, schedule slots, and FAQs are static for the duration of the annual festival.
- **Decision:** Store strongly-typed fest models in `src/data/techySheikhpuraData.ts` and safely serialize booked delegate passes in `localStorage` inside `try/catch` guards.
- **Consequences:**
  - *Pros:* Zero query latency, instant search/filter, resilient offline access.
  - *Cons:* Schedule updates require code deployments.
