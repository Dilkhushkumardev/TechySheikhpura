# Architecture Decision Records (ADR) — TechySheikhpura '26

## ADR-001: Vite + React 19 + TypeScript over Heavy Frameworks
- **Date:** 2026-11-10
- **Decision:** Use Vite + React 19 + TypeScript as a high-performance Single Page Application (SPA).
- **Reason:** Provides sub-second hot reload, instant interactive modal rendering, and client-side ticket generation without needing complex backend server runtimes.

---

## ADR-002: 1:1 Aesthetic Alignment with TechVerse DCE
- **Date:** 2026-11-10
- **Decision:** Use `#020003` dark void background, `Syne` and `Inter` Google Fonts, and the authentic TechVerse footer artwork (`/footer-bg.png`).
- **Reason:** The user explicitly requested an exact match with the visual design of `https://techverse-dce.me/` under the GEC Sheikhpura identity.

---

## ADR-003: Authentic Campus Administrative Block as Hero Backdrop
- **Date:** 2026-11-10
- **Decision:** Use the user-provided high-resolution photo of GEC Sheikhpura Administrative Block (`/gecs-campus.jpg`) as the hero backdrop.
- **Reason:** Preserves authentic institutional identity while layering it with TechVerse dark gradient overlays.

---

## ADR-004: Client-Side Holographic Delegate Pass & Confetti
- **Date:** 2026-11-10
- **Decision:** Generate dynamic digital passes with QR code data in `PassBookingModal.tsx` and trigger `canvas-confetti`.
- **Reason:** Gives students instant gratification and downloadable proof of registration.

