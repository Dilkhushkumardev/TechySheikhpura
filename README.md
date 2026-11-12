# TechySheikhpura '26

> **"Where Ideas Meet Innovation"** — Official Annual Intra-College Techno-Cultural & Innovation Festival of **Government Engineering College, Sheikhpura (GEC Sheikhpura), Bihar**.

[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 7](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Oxlint-0_Errors-10B981?style=for-the-badge&logo=oxc&logoColor=white)](https://oxc.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

[PRD Documentation](docs/PRD.md) • [System Architecture](docs/ARCHITECTURE.md) • [Design System](docs/DESIGN.md) • [Test Plan](docs/TEST_PLAN.md)

---

## Executive Summary

**TechySheikhpura '26** is the flagship intra-college technical, robotics, coding, and esports festival portal for **Government Engineering College, Sheikhpura (GEC Sheikhpura)**.

Built with a **TechVerse-inspired pitch-midnight aesthetic (`#020003`)**, the SPA pairs an authentic photograph of the **Administrative Block** with a live HUD countdown timer, an interactive 14-event showcase with real-time search and rule modals, subsidized delegate pass booking with holographic SVG QR passes and confetti, a seamless scrolling marquee ticker, and a panoramic crowd-celebration footer with outlined **GEC SHEIKHPURA** typography.

---

## Visual Highlights

| Section                 | Highlights                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hero Landing**        | High-resolution GEC Sheikhpura Administrative Block backdrop with midnight void fade, centered `Oxanium` display heading, and live registration ticker. |
| **Countdown Timer**     | Real-time HUD countdown computing Days : Hours : Minutes : Seconds to November 28, 2026 (09:00 IST).                                                    |
| **Events Arena**        | 14 engineering events across Coding, Robotics, Aero & Drone, Esports, Startup & Pitch, Mechanical & Civil, and Fun & Brain with instant search.         |
| **Delegate Passes**     | E-Sports Pass (₹29), All-Events Pass (₹149), and VIP All-Access Pass (₹199) with deterministic holographic SVG QR badges and confetti burst.            |
| **Schedule & Timeline** | Tabbed Day 1 vs Day 2 itinerary switcher detailing session times and campus venues.                                                                     |
| **Signature Footer**    | Custom AI twilight tech illustration (`footer-bg.jpg`), Telegram community pill, and giant outlined **GEC SHEIKHPURA** typography.                      |

---

## Key Features

- **Authentic Campus Identity:** Real photography of the GEC Sheikhpura Administrative Block on NH-333A, Mehus.
- **TechVerse 1:1 Theme Consistency:** `#020003` canvas, obsidian `#0b0b11` cards, Google Fonts `Oxanium`, `Space Grotesk`, `Plus Jakarta Sans`, & `Barlow Condensed`, and unified fuchsia/purple accents across modals and 404 views.
- **14 Technical & Gaming Events:**
  - **HackArena:** 24-Hour Collaborative Code Sprint
  - **Track-O-Bot:** Autonomous Line Follower & Obstacle Bot
  - **AeroStrike:** Precision Drone Obstacle Derby
  - **Speed Stroke:** Mechanical Keyboard Typing & Debugging
  - **Pro-To-Pitch:** Startup Prototype Investor Pitch
  - **Decode GECS:** Campus-Wide Cryptic Treasure Hunt
  - **MechDash:** 3D CAD Parametric Modeling Race
  - **Nirman (Bridge Crafter):** Popsicle Stick Truss Bridge Load Test
  - **Esports Arena:** BGMI Battle Royale & Free Fire Clash
  - **TriLexicon:** Science & Tech Trivia Clash
  - **Circuitrix:** Analog/Digital Breadboard Debugging
  - **WebCraft Studio:** Responsive UI/UX & Web Sprint
  - **TechnoCross:** Engineering Crossword & Rapid Logic Puzzle
- **Instant Event Search & Category Filtering:** Real-time keyword matching across titles, categories, descriptions, and venues.
- **Holographic QR Delegate Pass Modal:** Synced pass tier selection, inline validation, safe `localStorage` persistence, printable slip, and offline SVG QR pass generation.
- **Safe Web Audio API Sound FX:** Reusable hardware audio context with floating mute/unmute toggle.

---

## Tech Stack & Architecture

```text
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
│     React 19.3  •  TypeScript 7.0  •  Tailwind CSS     │
│     Pages: /, /verify (QR Lookup), /admin (Desk)       │
└───────────────────────────┬────────────────────────────┘
                            │ /api/* (Vite Proxy :5173 -> :5000)
┌───────────────────────────▼────────────────────────────┐
│                  Node 24 REST API Layer                │
│   server/index.ts • server/routes/api.ts • Admin Auth  │
└───────────────────────────┬────────────────────────────┘
                            │ node:sqlite (WAL + Foreign Keys)
┌───────────────────────────▼────────────────────────────┐
│                Embedded SQLite Database                │
│     server/db/schema.sql • server/db/database.ts       │
│  17 Tables • 3 Views • Auto-Seeded Catalog • Backups   │
└────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```text
GECS/
├── docs/                           # Complete engineering & backend design suite (BACKEND_DESIGN.md)
├── public/
│   ├── gecs-campus.jpg             # GEC Sheikhpura Administrative Block photo
│   ├── footer-bg.jpg               # Custom AI-generated twilight footer artwork
│   └── favicon.svg                 # Fest emblem favicon
├── server/
│   ├── app.ts                      # HTTP handler factory + dist/ SPA fallback
│   ├── index.ts                    # Node 24 HTTP server (port 5000) & graceful shutdown
│   ├── dev.mjs                     # Clean dual-process Backend (:5000) + Vite (:5173) launcher
│   ├── config/env.ts               # .env loader & typed backend runtime configuration
│   ├── middleware/                 # HMAC auth tokens, sliding-window rate limits & headers
│   ├── db/
│   │   ├── schema.sql              # 17-table relational SQLite schema, views & triggers
│   │   └── database.ts             # WAL-mode DatabaseSync, auto-seeding, CRUD & analytics
│   ├── routes/                     # Modular public & admin REST endpoints + CSV export
│   └── tests/api.test.ts           # Built-in node:test API & SQLite integration tests
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── ParticleCanvas.tsx  # Ambient particle network canvas
│   │   └── techy/
│   │       ├── CountdownTimer.tsx  # Live HUD countdown timer
│   │       ├── DelegateQrSvg.tsx   # Shared deterministic 13x13 QR badge
│   │       ├── EventDetailModal.tsx# Event guidelines & coordinator contacts modal
│   │       ├── HelpdeskSection.tsx # Student support form backed by POST /api/inquiries
│   │       ├── PassBookingModal.tsx# SQLite-backed pass booking form + offline fallback
│   │       ├── TechyNavbar.tsx     # Sticky navbar (Verify Pass, Desk, Get Fest Pass)
│   │       └── TechyFooter.tsx     # Twilight footer with Team Hunter & Telegram channel
│   ├── data/
│   │   └── techySheikhpuraData.ts  # 14 Events, 3 Pass Tiers, Schedule & FAQs baseline
│   ├── pages/
│   │   ├── HomePage.tsx            # Entry re-export of TechySheikhpuraPage
│   │   ├── TechySheikhpuraPage.tsx # Main fest SPA hydrated from /api/fest
│   │   ├── VerifyPassPage.tsx      # Public pass verification route (/verify)
│   │   ├── AdminDashboardPage.tsx  # Organizer check-in & analytics console (/admin)
│   │   └── NotFoundPage.tsx        # Cyber 404 anomaly route
│   ├── services/
│   │   └── api.ts                  # Typed frontend API service & DTOs
│   ├── App.tsx                     # Root Router shell
│   ├── main.tsx                    # React DOM strict entrypoint
│   └── index.css                   # Tailwind imports & custom keyframes
├── .env.example                    # Environment & backend PIN template
├── index.html                      # Root HTML with Oxanium, Space Grotesk & UI fonts
├── package.json                    # Dependencies & full-stack scripts
├── tailwind.config.js              # Tailwind extensions
├── tsconfig.node.json              # Strict Node/server TypeScript config
├── tsconfig.app.json               # Strict application TS config
└── vite.config.ts                  # Vite bundler & /api proxy config
```

---

## Quick Start & Local Setup

### Prerequisites

- Node.js **v24.0.0** or higher (for built-in `node:sqlite`)
- npm

### 1. Clone & Install

```bash
git clone https://github.com/Dilkhushkumardev/TechySheikhpura.git
cd TechySheikhpura
npm install
```

### 2. Start Full-Stack Development (Backend + Frontend)

```bash
npm run dev
```

- **Frontend (Vite + Proxy):** `http://localhost:5173/`
- **Backend API + SQLite (`server/data/techysheikhpura.db`):** `http://localhost:5000/`
- **Pass Verification Portal:** `http://localhost:5173/verify`
- **Organizer Desk Console:** `http://localhost:5173/admin` (Default dev PIN: `GECS2026`, override via `ORGANIZER_PIN` env var)

### 3. Production Build & Serve

```bash
# Lint check (0 warnings, 0 errors)
npm run lint

# Automated backend API & SQLite integration test suite
npm test

# Typecheck (tsc -b across client + server) + Vite production bundle
npm run build

# Serve production API + dist/ SPA bundle together
npm start
```

---

## Participating Student Clubs & Chapters

- **CodeGECS Club:** Competitive programming, WebCraft Studio & HackArena coordination.
- **RoboGEC Society:** Robotics, Circuitrix & Track-O-Bot arena.
- **AeroX Flight Wing:** Quadcopter aerodynamics & AeroStrike obstacle derby.
- **E-Cell Sheikhpura:** Student incubation, startup mentorship & Pro-To-Pitch.
- **GECS Esports Guild:** Competitive gaming leagues for BGMI & Free Fire MAX.

---

## License & Credits

- **Organized By:** Government Engineering College, Sheikhpura (GEC Sheikhpura), Bihar.
- **Design Inspiration:** `https://techverse-dce.me/`.
- **License:** [MIT License](LICENSE).
