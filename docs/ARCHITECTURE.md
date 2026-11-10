# 🏗️ System Architecture & Engineering Specifications

<div align="center">

# ⚡ TechySheikhpura '26 — System Architecture
**High-Performance Client-Side Single Page Application (SPA)**

---

[![Vite 8](https://img.shields.io/badge/Bundler-Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/Runtime-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind 3.4](https://img.shields.io/badge/Styles-Tailwind_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph Browser ["Client Browser Environment"]
        DOM["HTML5 / DOM"]
        AudioAPI["Web Audio API Synthesizer"]
        CanvasEngine["Canvas 2D Confetti & FX"]
        Storage["Browser LocalStorage"]
    end

    subgraph AppLayer ["React Application Layer"]
        Root["main.tsx (Root Renderer)"]
        AppComp["App.tsx (Router & Shell)"]
        
        subgraph Pages ["Pages & Views"]
            Home["HomePage.tsx (Clean Re-export)"]
            Master["TechySheikhpuraPage.tsx (Master Fest View)"]
            NotFound["NotFoundPage.tsx (404 Anomaly Route)"]
        end

        subgraph Components ["Modular Component Hierarchy"]
            Nav["TechyNavbar.tsx"]
            Timer["CountdownTimer.tsx"]
            PassModal["PassBookingModal.tsx"]
            EventModal["EventDetailModal.tsx"]
            Footer["TechyFooter.tsx"]
        end

        subgraph DataLayer ["Data & Domain Models"]
            FestData["techySheikhpuraData.ts"]
        end
    end

    DOM --> Root
    Root --> AppComp
    AppComp --> Pages
    Master --> Components
    Components --> FestData
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
    participant Search as Instant Search Filter
    participant Modal as EventDetailModal / PassBookingModal
    participant Storage as LocalStorage
    participant FX as Confetti & Audio Engine

    User->>Nav: Click "Get Fest Pass"
    Nav->>Page: Trigger handleOpenPass('all-events-pass')
    Page->>FX: Synthesize cyber click audio tone (Web Audio API)
    Page->>Modal: Open PassBookingModal with selected tier
    User->>Modal: Fill Name, Roll No, Branch, Contact
    User->>Modal: Submit Pass Form
    Modal->>Storage: Store serialized delegate pass JSON
    Modal->>FX: Fire confetti burst (particleCount: 120, colors: cyan, fuchsia)
    Modal->>User: Display Holographic QR Pass Card & Print Option
```

---

## 3. Component Hierarchy Tree

```
src/
├── App.tsx                              # BrowserRouter & Root Container
├── main.tsx                             # StrictMode entrypoint
├── pages/
│   ├── HomePage.tsx                     # Re-exporting TechySheikhpuraPage
│   ├── TechySheikhpuraPage.tsx          # Single-Page Fest Architecture:
│   │   ├── Navigation                   # Sticky Navbar with branding
│   │   ├── Hero Section                 # Real Campus Image + Centered Title
│   │   ├── Countdown Timer              # Live HUD countdown
│   │   ├── Marquee Ticker               # Continuous event ticker
│   │   ├── About Section                # Core pillars & headquarters card
│   │   ├── Events Arena                 # Category pills + real-time search
│   │   ├── Passes Section               # 3-tier pass pricing cards
│   │   ├── Clubs Showcase               # GEC Sheikhpura 5 student societies
│   │   ├── Schedule Section             # Day 1 vs Day 2 switcher
│   │   ├── FAQs Accordion               # Collapsible clarifications
│   │   └── Footer Section               # Exact TechVerse crowd artwork & outline
│   └── NotFoundPage.tsx                 # 404 Error handler
└── components/techy/
    ├── CountdownTimer.tsx               # High-contrast HUD timer
    ├── EventDetailModal.tsx             # Complete guidelines & contacts dialog
    ├── PassBookingModal.tsx             # Interactive holographic pass generator
    ├── TechyNavbar.tsx                  # Responsive navigation bar
    └── TechyFooter.tsx                  # Panoramic TechVerse aesthetic footer
```

---

## 4. Performance & Bundle Metrics

| Metric | Target | Measured Result |
|---|---|---|
| **Production Build Time** | `< 2.5s` | **1.62s** (`tsc -b && vite build`) |
| **Gzip JS Bundle Size** | `< 120 kB` | **108.03 kB** |
| **Gzip CSS Bundle Size** | `< 12 kB` | **7.09 kB** |
| **Linter Diagnostic Output** | `0 Warnings` | **0 Warnings, 0 Errors (`oxlint`)** |
| **First Contentful Paint (FCP)** | `< 0.8s` | **~0.4s** (Vite pre-bundled chunks) |
