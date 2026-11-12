# System Architecture & Engineering Specifications

> **TechySheikhpura '26** — High-Performance Client-Side Single Page Application (SPA) for Government Engineering College, Sheikhpura (GEC Sheikhpura).

[![Vite 8](https://img.shields.io/badge/Bundler-Vite_8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/Runtime-React_19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 7](https://img.shields.io/badge/Language-TypeScript_7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind 3.4](https://img.shields.io/badge/Styles-Tailwind_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    subgraph Browser["Client Browser Environment"]
        DOM["HTML5 / DOM"]
        AudioAPI["Web Audio API Synthesizer"]
        CanvasEngine["Canvas 2D Confetti & FX"]
        Storage["Browser LocalStorage"]
    end

    subgraph AppLayer["React Application Layer"]
        Root["main.tsx (Root Renderer)"]
        AppComp["App.tsx (Router & Shell)"]

        subgraph Pages["Pages & Views"]
            Home["HomePage.tsx (Clean Re-export)"]
            Master["TechySheikhpuraPage.tsx (Master Fest View)"]
            NotFound["NotFoundPage.tsx (404 Anomaly Route)"]
        end

        subgraph Components["Modular Component Hierarchy"]
            Nav["TechyNavbar.tsx"]
            Timer["CountdownTimer.tsx"]
            PassModal["PassBookingModal.tsx"]
            EventModal["EventDetailModal.tsx"]
            Footer["TechyFooter.tsx"]
        end

        subgraph DataLayer["Data & Domain Models"]
            FestData["techySheikhpuraData.ts"]
        end
    end

    DOM --> Root
    Root --> AppComp
    AppComp --> Home
    AppComp --> NotFound
    Home --> Master
    Master --> Nav
    Master --> Timer
    Master --> PassModal
    Master --> EventModal
    Master --> Footer
    Master --> FestData
    PassModal --> FestData
    EventModal --> FestData
    PassModal --> Storage
    PassModal --> CanvasEngine
    Master --> AudioAPI
```

---

## 2. Component Interaction & State Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Visitor
    participant Nav as TechyNavbar
    participant Page as TechySheikhpuraPage
    participant Modal as EventDetailModal / PassBookingModal
    participant Storage as LocalStorage
    participant FX as Confetti & Audio Engine

    User->>Nav: Click "Get Fest Pass"
    Nav->>Page: Trigger handleOpenPass("all-events-pass")
    Page->>FX: Synthesize cyber click audio tone (Web Audio API)
    Page->>Modal: Open PassBookingModal with selected tier
    User->>Modal: Fill Name, Roll No, Branch, Year, Contact
    User->>Modal: Submit Pass Form
    Modal->>Storage: Safely serialize delegate pass JSON
    Modal->>FX: Fire confetti burst (particleCount: 120)
    Modal->>User: Display Holographic QR Pass Card & Print Option
```

---

## 3. Component Hierarchy Tree

```text
src/
├── App.tsx                               # BrowserRouter & Root Container
├── main.tsx                              # StrictMode entrypoint
├── index.css                             # Global Tailwind utilities & animations
├── data/
│   └── techySheikhpuraData.ts            # 14 Events, 3 Pass Tiers, Schedule & FAQs
├── pages/
│   ├── HomePage.tsx                      # Clean re-export of TechySheikhpuraPage
│   ├── TechySheikhpuraPage.tsx           # Single-Page Fest Application:
│   │   ├── Navigation                    # Sticky Navbar with branding
│   │   ├── Hero Section                  # Campus Photo + Centered Title
│   │   ├── Countdown Timer               # Live HUD countdown
│   │   ├── Marquee Ticker                # Continuous event ticker
│   │   ├── About Section                 # Core pillars & headquarters card
│   │   ├── Events Arena                  # Category pills + real-time search (14 events)
│   │   ├── Passes Section                # 3-tier pass pricing cards
│   │   ├── Clubs Showcase                # GEC Sheikhpura 5 student societies
│   │   ├── Schedule Section              # Day 1 vs Day 2 switcher
│   │   ├── FAQs Accordion                # Collapsible clarifications
│   │   └── Footer Section                # Exact TechVerse crowd artwork & outline
│   └── NotFoundPage.tsx                  # 404 Error handler
└── components/techy/
    ├── CountdownTimer.tsx                # High-contrast HUD timer
    ├── EventDetailModal.tsx              # Complete guidelines & contacts dialog
    ├── PassBookingModal.tsx              # Interactive holographic QR pass generator
    ├── TechyNavbar.tsx                   # Responsive navigation bar
    └── TechyFooter.tsx                   # Panoramic TechVerse aesthetic footer
```

---

## 4. Performance & Bundle Metrics

| Metric | Target | Measured Result |
|---|---|---|
| **Production Build Time** | `< 2.5s` | **1.61s** (`tsc -b && vite build`) |
| **Gzip JS Bundle Size** | `< 120 kB` | **109.63 kB** (`358.31 kB` raw) |
| **Gzip CSS Bundle Size** | `< 12 kB` | **7.02 kB** (`37.33 kB` raw) |
| **Linter Diagnostic Output** | `0 Warnings` | **0 Warnings, 0 Errors (`oxlint`)** |
| **TypeScript Strict Mode** | `0 Errors` | **Strict + VerbatimModuleSyntax Passing** |
