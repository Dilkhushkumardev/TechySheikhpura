# 💡 Architecture Decision Records (ADR)

<div align="center">

# ⚡ TechySheikhpura '26 — Technical Decisions
**Permanent Architecture & Design Choices**

---

[![Decisions: 6 ADRs](https://img.shields.io/badge/ADRs-6_Recorded-3178C6?style=for-the-badge)](docs/DECISIONS.md)
[![Architecture: SPA](https://img.shields.io/badge/Type-Single_Page_App-61DAFB?style=for-the-badge)](docs/ARCHITECTURE.md)

</div>

---

## ADR Index

| ADR ID | Decision Title | Status | Date |
|---|---|---|---|
| **ADR-001** | Vite + React 19 Client SPA over Server Framework | `ACCEPTED` | 2026-11-10 |
| **ADR-002** | Adoption of TechVerse 1:1 Aesthetic Identity (`#020003`, Syne, Inter) | `ACCEPTED` | 2026-11-10 |
| **ADR-003** | Authentic Administrative Block Photography as Hero Backdrop | `ACCEPTED` | 2026-11-10 |
| **ADR-004** | Client-Side Holographic Ticket & Dynamic Confetti Engine | `ACCEPTED` | 2026-11-10 |
| **ADR-005** | Elimination of Google Maps & Complex Contact Form | `ACCEPTED` | 2026-11-10 |
| **ADR-006** | In-Memory Data Model with LocalStorage Ticket Persistence | `ACCEPTED` | 2026-11-10 |

---

### ADR-001: Vite + React 19 Client SPA over Server Framework

- **Context:** The college fest requires an ultra-responsive, visually stunning website that loads instantly on mobile 4G networks without cold starts or server latency.
- **Decision:** Build as a single-page application using Vite 8, React 19, and TypeScript.
- **Consequences:**
  - *Pros:* Near-instant page loads (~0.4s FCP), zero backend server hosting overhead, sub-second HMR during development.
  - *Cons:* Dynamic ticket generation relies on client-side state rather than server databases (resolved via LocalStorage).

---

### ADR-002: Adoption of TechVerse 1:1 Aesthetic Identity

- **Context:** The user specifically requested a website modeled after `https://techverse-dce.me/` under the identity of GEC Sheikhpura.
- **Decision:** Use `#020003` deep midnight void, Google Fonts `Syne` and `Inter`, obsidian glass cards, fuchsia/magenta ambient radiance, and clean crowd artwork in the footer.
- **Consequences:**
  - *Pros:* Delivers the exact premium, futuristic techno-cultural atmosphere desired by the student community.
  - *Cons:* Requires disciplined styling adherence to prevent accidental theme drift into generic cyan or corporate blue.

---

### ADR-003: Authentic Administrative Block Photography as Hero Backdrop

- **Context:** To ensure students and visitors recognize the institution immediately, authentic imagery was essential.
- **Decision:** Use the real photograph of GEC Sheikhpura Administrative Block (`/gecs-campus.jpg`) as the hero backdrop layered with a midnight gradient overlay.
- **Consequences:**
  - *Pros:* High institutional pride and authenticity.
  - *Cons:* Needs careful dark gradient overlay tuning (`brightness-[0.32]` and `contrast-125`) so white text remains perfectly legible.

---

### ADR-004: Client-Side Holographic Ticket & Dynamic Confetti Engine

- **Context:** Students booking their fest delegate pass need immediate, celebratory confirmation.
- **Decision:** Implement `PassBookingModal.tsx` using `canvas-confetti` and generate an animated holographic delegate pass card with a scannable QR code.
- **Consequences:**
  - *Pros:* Delightful user experience that encourages students to share screenshots on WhatsApp and Instagram.
  - *Cons:* Requires inclusion of the lightweight `canvas-confetti` package (~12kB).

---

### ADR-005: Elimination of Google Maps & Complex Contact Form

- **Context:** The user explicitly instructed to remove the map section and keep the footer clean and identical to the reference image.
- **Decision:** Remove the Google Maps iframe, secretariat contact box, and replace with the TechVerse panoramic crowd footer with direct student coordinator tel links.
- **Consequences:**
  - *Pros:* Eliminates heavy third-party Google Maps iframe load (~800kB savings) and simplifies the layout.
  - *Cons:* Users must rely on address text and coordinator phone numbers instead of an interactive map.

---

### ADR-006: In-Memory Data Model with LocalStorage Ticket Persistence

- **Context:** The fest features 14+ events, 3 pass tiers, Day 1 & Day 2 itinerary, and FAQs that do not change frequently during the event.
- **Decision:** Store all festival domain structures in `src/data/techySheikhpuraData.ts` as strongly-typed TypeScript constants, and persist user-booked passes in `localStorage`.
- **Consequences:**
  - *Pros:* Zero latency queries, instant filtering, fully functional offline.
  - *Cons:* Event schedule edits require code updates rather than an external CMS (appropriate for an annual fest).
