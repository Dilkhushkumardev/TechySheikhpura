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

| Section | Highlights |
|---|---|
| **Hero Landing** | High-resolution GEC Sheikhpura Administrative Block backdrop with midnight void fade, centered `Syne` display heading, and live registration ticker. |
| **Countdown Timer** | Real-time HUD countdown computing Days : Hours : Minutes : Seconds to November 28, 2026 (09:00 IST). |
| **Events Arena** | 14 engineering events across Coding, Robotics, Aero & Drone, Esports, Startup & Pitch, Mechanical & Civil, and Fun & Brain with instant search. |
| **Delegate Passes** | E-Sports Pass (₹29), All-Events Pass (₹149), and VIP All-Access Pass (₹199) with deterministic holographic SVG QR badges and confetti burst. |
| **Schedule & Timeline** | Tabbed Day 1 vs Day 2 itinerary switcher detailing session times and campus venues. |
| **Signature Footer** | Panoramic purple crowd illustration (`footer-bg.png`), WhatsApp/Instagram/LinkedIn community pills, and giant outlined **GEC SHEIKHPURA** typography. |

---

## Key Features

- **Authentic Campus Identity:** Real photography of the GEC Sheikhpura Administrative Block on NH-333A, Mehus.
- **TechVerse 1:1 Theme Consistency:** `#020003` canvas, obsidian `#0b0b11` cards, Google Fonts `Syne` & `Inter`, and unified fuchsia/purple accents across modals and 404 views.
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
│      Google Fonts: Syne (Display) & Inter (Body)       │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Component System                    │
│   TechyNavbar • Hero • CountdownTimer • EventsGrid     │
│   PassBookingModal • EventDetailModal • TechyFooter    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Data & Utilities                    │
│  techySheikhpuraData.ts • Web Audio API • Confetti FX  │
│        Safe LocalStorage Ticket Persistence            │
└────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```text
GECS/
├── docs/                           # Complete engineering & QA documentation suite
│   ├── PRD.md                      # Product requirements & 14-event catalog
│   ├── ARCHITECTURE.md             # System architecture, diagrams & metrics
│   ├── DESIGN.md                   # Design tokens (#020003, Syne, Inter)
│   ├── RULES.md                    # Strict TypeScript & engineering rules
│   ├── TASKS.md                    # Completed project phases & milestones
│   ├── DECISIONS.md                # Architecture Decision Records (ADRs)
│   ├── MEMORY.md                   # Active state & institutional branding parameters
│   ├── TEST_PLAN.md                # QA feature matrix & viewport checks
│   └── SECURITY.md                 # Client sanitization & safe lifecycle specs
├── public/
│   ├── gecs-campus.jpg             # GEC Sheikhpura Administrative Block photo
│   ├── footer-bg.png               # Panoramic TechVerse crowd artwork
│   └── favicon.svg                 # Fest emblem favicon
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── ParticleCanvas.tsx  # Ambient particle network canvas
│   │   └── techy/
│   │       ├── CountdownTimer.tsx  # Live HUD countdown timer
│   │       ├── EventDetailModal.tsx# Event guidelines & coordinator contacts modal
│   │       ├── PassBookingModal.tsx# Interactive pass form & QR pass generator
│   │       ├── TechyNavbar.tsx     # Sticky responsive navbar
│   │       └── TechyFooter.tsx     # Exact TechVerse panoramic footer
│   ├── data/
│   │   └── techySheikhpuraData.ts  # 14 Events, 3 Pass Tiers, Schedule & FAQs
│   ├── pages/
│   │   ├── HomePage.tsx            # Entry re-export of TechySheikhpuraPage
│   │   ├── TechySheikhpuraPage.tsx # Main fest single-page application
│   │   └── NotFoundPage.tsx        # Cyber 404 anomaly route
│   ├── App.tsx                     # Root Router shell
│   ├── main.tsx                    # React DOM strict entrypoint
│   └── index.css                   # Tailwind imports & custom keyframes
├── .env.example                    # Environment template
├── index.html                      # Root HTML with Syne & Inter fonts
├── package.json                    # Dependencies & npm scripts
├── tailwind.config.js              # Tailwind extensions
├── tsconfig.app.json               # Strict application TS config
└── vite.config.ts                  # Vite bundler config
```

---

## Quick Start & Local Setup

### Prerequisites

- Node.js v18.0.0 or higher
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/Dilkhushkumardev/TechySheikhpura.git
cd TechySheikhpura
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173/`.

### 4. Run Linter & Strict TypeScript Build

```bash
# Lint check (0 warnings, 0 errors)
npm run lint

# Typecheck (tsc -b) + Vite production bundle
npm run build
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
