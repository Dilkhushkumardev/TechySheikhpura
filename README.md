<div align="center">

# ⚡ TechySheikhpura '26

### **"Where Ideas Meet Innovation"**
**The Flagship Annual Intra-College Techno-Cultural Festival**  
**Government Engineering College, Sheikhpura (GEC Sheikhpura), Bihar**

---

[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Oxlint-Passing_0_Errors-10B981?style=for-the-badge&logo=oxc&logoColor=white)](https://oxc.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

[🌐 Live Demo](http://localhost:5173/) • [📖 PRD Documentation](docs/PRD.md) • [🏗️ Architecture](docs/ARCHITECTURE.md) • [🎨 Design System](docs/DESIGN.md)

---

</div>

<br/>

## 🌟 Executive Summary

**TechySheikhpura '26** is the official premier intra-college technical, innovation, and esports festival website of **Government Engineering College, Sheikhpura (GEC Sheikhpura)**, established by the Department of Science, Technology and Technical Education, Government of Bihar.

Crafted with a futuristic **TechVerse-inspired midnight aesthetic** (`#020003`), the platform features an authentic photographic backdrop of the college's iconic **Administrative Block**, a real-time HUD countdown timer, an interactive 14+ events arena with live search, digital delegate pass generation with holographic QR codes, celebratory confetti, and a crowd-celebration footer featuring massive outlined institutional typography.

---

## 📸 Visual Highlights

| Section | Preview & Highlights |
|---|---|
| **Hero Landing** | Cinematic high-resolution GEC Sheikhpura Administrative Block backdrop with dark gradient void fade, centered display typography (`Syne` font), and live registration activity ticker. |
| **Countdown Timer** | Real-time cyber HUD timer computing Days : Hours : Minutes : Seconds to Nov 28, 2026. |
| **Events Arena** | 14+ engineering challenges across Coding, Robotics, Drones, Esports, Civil/Mechanical & Startups with instant search and rules modal. |
| **Pass Booking** | All-Events Pass (₹149), Esports Arena Pass (₹29), and VIP Pass (₹199) with real-time holographic QR ID card generation & confetti blast. |
| **Schedule & Timeline** | Tabbed Day 1 vs Day 2 itinerary switcher detailing time slots and campus venues. |
| **Signature Footer** | Panoramic purple collaboration artwork with WhatsApp, Instagram, LinkedIn community pills, and giant outlined **GEC SHEIKHPURA** typography. |

---

## 🚀 Key Features

- **⚡ Authentic Campus Visual Identity:** Real photography of GEC Sheikhpura Administrative Block on NH-333A Mehus.
- **🎨 1:1 TechVerse Aesthetic Alignment:** Pure `#020003` dark void, obsidian glass cards (`#0b0b11`), Google Fonts `Syne` & `Inter`, and radiant fuchsia/magenta ambient glows.
- **🎯 14+ Engineering Challenges:**
  - 💻 **HackArena:** 24-Hour Non-stop Collaborative Code Sprint (₹18,000+ prizes).
  - 🤖 **Track-O-Bot:** Autonomous Line Follower & Obstacle Bot Duel (₹12,000+ prizes).
  - 🛸 **AeroStrike:** Precision Drone Obstacle Derby & RC Flying Duel (₹10,000+ prizes).
  - ⌨️ **Speed Stroke:** High-Pressure Mechanical Keyboard Typing & Debugging.
  - 🚀 **Pro-To-Pitch:** Startup Innovation & Prototype Investor Pitch.
  - 🧩 **Decode GECS:** Campus-Wide Cryptic Treasure Hunt & Cipher Quest.
  - 🌉 **Nirman (Bridge Crafter):** Popsicle Stick Truss Bridge Structural Load Test.
  - ⚙️ **MechDash:** CAD 3D Modeling & Stress Analysis Speedrun.
  - 🎮 **Esports Arena:** BGMI Battle Royale Squads & Free Fire MAX Solo/Duo.
- **🔍 Instant Event Search & Filter:** Real-time keyword filtering across title, category, description, and rules.
- **🎟️ Interactive Pass Booking System:**
  - Live form input with branch & year selection.
  - Generates verifiable holographic digital delegate badge with dynamic QR code.
  - Multi-burst `canvas-confetti` celebration.
- **🔊 Web Audio API Sound Effects:** Synthesized futuristic cyber clicks and chimes with floating UI toggle.
- **📱 Fully Responsive:** Tailored for seamless navigation across mobile (375px), tablet (768px), and high-DPI desktop viewports.

---

## 🛠️ Tech Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
│      React 19  •  TypeScript 5.8  •  Tailwind CSS     │
│       Google Fonts: Syne (Display) & Inter (Body)      │
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
│               LocalStorage Ticket Persistence          │
└────────────────────────────────────────────────────────┘
```

- **Frontend Core:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Icons:** `lucide-react`
- **Celebration Effects:** `canvas-confetti`
- **Linting & Code Quality:** Oxlint (0 warnings, 0 errors)

---

## 📁 Project Directory Structure

```
GECS/
├── docs/                         # Complete Vibe Coding Documentation Suite
│   ├── PRD.md                    # Product Requirements & User Definition
│   ├── ARCHITECTURE.md           # System Architecture & Component Tree
│   ├── DESIGN.md                 # Design System (#020003, Syne, Inter, Tokens)
│   ├── RULES.md                  # Development Rules & Coding Standards
│   ├── TASKS.md                  # Step-by-Step Task Breakdown & Progress
│   ├── DECISIONS.md              # Architecture Decision Records (ADRs)
│   ├── MEMORY.md                 # Active Project Memory & State
│   ├── TEST_PLAN.md              # Quality Assurance Checklist
│   └── SECURITY.md               # Client Security & Secret Management
├── public/
│   ├── gecs-campus.jpg           # GEC Sheikhpura Admin Block Photo
│   ├── footer-bg.png             # Authentic TechVerse Crowd Artwork
│   └── favicon.svg               # Fest Emblem Favicon
├── src/
│   ├── assets/                   # Static media assets
│   ├── components/
│   │   ├── common/
│   │   │   └── ParticleCanvas.tsx# Ambient Network Canvas
│   │   └── techy/
│   │       ├── CountdownTimer.tsx# Live HUD Countdown Timer
│   │       ├── EventDetailModal.tsx # Rules & Coordinators Modal
│   │       ├── PassBookingModal.tsx # Holographic Pass Generator
│   │       ├── TechyNavbar.tsx   # Glassmorphic Sticky Navigation
│   │       └── TechyFooter.tsx   # Exact TechVerse-Style Panoramic Footer
│   ├── data/
│   │   └── techySheikhpuraData.ts# 14+ Events, Passes, Itinerary & FAQs
│   ├── pages/
│   │   ├── HomePage.tsx          # Clean entrypoint re-export
│   │   ├── TechySheikhpuraPage.tsx # Master Fest Single-Page Application
│   │   └── NotFoundPage.tsx      # Cyber 404 Route
│   ├── App.tsx                   # App Root & Client Router
│   ├── main.tsx                  # React DOM Entrypoint
│   └── index.css                 # Custom Utilities & Keyframes
├── .env.example                  # Environment Configuration Template
├── index.html                    # Root HTML with Google Fonts Syne & Inter
├── package.json                  # Dependencies & Scripts
├── tailwind.config.js            # Tailwind Theme Extensions
└── vite.config.ts                # Vite Configuration
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/GECS.git
cd GECS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### 4. Code Quality & Lint Check
```bash
npm run lint
```
*Validated with Oxlint: 0 warnings and 0 errors across all 15 project files.*

### 5. Production Build
```bash
npm run build
```
Creates an optimized, minified bundle in the `dist/` folder in under 2 seconds.

---

## 🏛️ Participating Student Clubs & Chapters

TechySheikhpura '26 is actively organized by the student clubs of GEC Sheikhpura:
- **CodeGECS Club:** Competitive programming, Web3 & HackArena coordination.
- **RoboGEC Society:** Robotics, embedded systems & Track-O-Bot arena.
- **AeroX Flight Wing:** Quadcopter aerodynamics & AeroStrike obstacle derby.
- **E-Cell Sheikhpura:** Student incubation, startup mentorship & Pro-To-Pitch.
- **GECS Esports Guild:** Competitive gaming leagues for BGMI & Free Fire MAX.

---

## 📄 License & Credits

- **Organized By:** Government Engineering College, Sheikhpura (GEC Sheikhpura), Bihar.
- **Design Inspiration:** `https://techverse-dce.me/` (Intra-College Tech Fest aesthetic).
- **Code License:** [MIT License](LICENSE) — Feel free to use and adapt with attribution.

<div align="center">
<br/>
<b>Made with lots of ❤︎ by TechySheikhpura Team</b><br/>
<sub>© 2026 Government Engineering College, Sheikhpura. All Rights Reserved.</sub>
</div>
