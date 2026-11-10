# Architecture — TechySheikhpura '26

## 1. Tech Stack
- **Framework:** React 19 (via Vite)
- **Language:** TypeScript 5.8+ (Strict mode, ES2022)
- **Styling:** Tailwind CSS 3.4 + Custom CSS Utilities
- **Typography:** Google Fonts: `Syne` (display & headings), `Inter` (body), `JetBrains Mono` (HUD & code)
- **Icons:** `lucide-react`
- **Effects & Canvas:** `canvas-confetti`, HTML5 Canvas particle system, Web Audio API synthesizer

---

## 2. Directory Structure
```
c:\Users\dilkh\OneDrive\Desktop\GECS
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── RULES.md
│   ├── TASKS.md
│   ├── DECISIONS.md
│   ├── MEMORY.md
│   ├── TEST_PLAN.md
│   └── SECURITY.md
├── public/
│   ├── gecs-campus.jpg           # GEC Sheikhpura Admin Block
│   ├── footer-bg.png             # TechVerse crowd artwork
│   └── ...
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   └── ParticleCanvas.tsx
│   │   └── techy/
│   │       ├── CountdownTimer.tsx
│   │       ├── EventDetailModal.tsx
│   │       ├── PassBookingModal.tsx
│   │       ├── TechyNavbar.tsx
│   │       └── TechyFooter.tsx
│   ├── data/
│   │   └── techySheikhpuraData.ts # Events, Passes, Timeline, FAQs
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── TechySheikhpuraPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
└── tailwind.config.js
```

---

## 3. Data Flow & State Management
1. **Static Data Layer (`techySheikhpuraData.ts`):**
   - Single source of truth for 14 events, 3 pass tiers, schedule items, and FAQs.
2. **Page State (`TechySheikhpuraPage.tsx`):**
   - `selectedCategory`: Active event category filter pill.
   - `searchQuery`: Real-time keyword filter across title, description, and tags.
   - `selectedDay`: Day 1 vs Day 2 itinerary switcher.
   - `activeEventForModal`: Currently inspected event object.
   - `passModalOpen` & `selectedPassId`: Controls delegate registration modal.
   - `mousePos`: Dynamic ambient spotlight tracker.
3. **Local Storage:**
   - Saved delegate passes stored under `techy_sheikhpura_passes`.
