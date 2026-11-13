# System Architecture & Engineering Specifications

> **TechySheikhpura '26** — Full-Stack Web Application & Embedded SQLite Backend for Government Engineering College, Sheikhpura (GEC Sheikhpura).

[![Vite 8](https://img.shields.io/badge/Bundler-Vite_8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/Runtime-React_19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 7](https://img.shields.io/badge/Language-TypeScript_7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/Database-Node_24_SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://nodejs.org/api/sqlite.html)

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    subgraph Browser["Client Browser Environment"]
        DOM["HTML5 / DOM"]
        AudioAPI["Web Audio API Synthesizer"]
        CanvasEngine["Canvas 2D Confetti & FX"]
        Storage["Browser LocalStorage Fallback"]
    end

    subgraph AppLayer["React Frontend Layer (Port 5173 in Dev)"]
        Root["main.tsx (Root Renderer)"]
        AppComp["App.tsx (Router & Shell)"]

        subgraph Pages["Pages & Views"]
            Home["HomePage.tsx -> TechySheikhpuraPage.tsx"]
            Verify["VerifyPassPage.tsx (/verify)"]
            Admin["AdminDashboardPage.tsx (/admin)"]
            NotFound["NotFoundPage.tsx (404 Route)"]
        end

        subgraph Components["Modular Components & Client Service"]
            Nav["TechyNavbar.tsx & TechyFooter.tsx"]
            Modals["PassBookingModal & EventDetailModal"]
            Helpdesk["HelpdeskSection.tsx (#contact)"]
            ApiClient["src/services/api.ts (REST DTO Client)"]
        end
    end

    subgraph BackendLayer["Node 24 Layered API & SQLite Architecture (Port 5000)"]
        HttpServer["server/index.ts & server/app.ts (HTTP + Graceful Shutdown)"]
        Middleware["server/middleware/* (Security Headers, Rate Limit, HMAC Auth)"]
        RouterAPI["server/routes/* (api.ts, publicRoutes.ts, adminRoutes.ts)"]
        DbLayer["server/db/database.ts + schema.sql"]
        SqliteFile[("server/data/techysheikhpura.db (WAL Mode)")]
    end

    DOM --> Root --> AppComp
    AppComp --> Home & Verify & Admin & NotFound
    Home --> Nav & Modals & Helpdesk
    Modals & Helpdesk & Verify & Admin --> ApiClient
    ApiClient -->|"/api/* (Vite Proxy or Production Same-Origin)"| HttpServer
    HttpServer --> Middleware --> RouterAPI --> DbLayer --> SqliteFile
    Modals --> Storage & CanvasEngine
    Home --> AudioAPI
```

---

## 2. Component Interaction & Database Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student or Organizer
    participant Nav as TechyNavbar
    participant Page as TechySheikhpuraPage
    participant PassModal as PassBookingModal
    participant API as POST /api/registrations
    participant DB as SQLite DatabaseSync
    participant FX as Confetti & LocalStorage

    User->>Nav: Click "Get Fest Pass"
    Nav->>Page: Invoke onOpenPassModal() callback
    Page->>PassModal: Open booking modal (with optional Event context)
    User->>PassModal: Fill Name, Roll No, Branch, Year, Team, Email, Phone
    PassModal->>API: Send validated JSON payload
    API->>DB: Transactional duplicate check + INSERT registration & activity_feed
    DB-->>API: Return persistent TS26-GECS-XXXXX pass record
    API-->>PassModal: 201 Created + refreshed activityStream
    PassModal->>FX: Mirror pass in localStorage + confetti burst
    PassModal->>User: Render SVG QR Badge, Print Slip & /verify Online link
```

---

## 3. Component Hierarchy & Repository Structure

```text
TechySheikhpura/
├── .github/workflows/
│   ├── ci.yml                              # Node 24 CI: npm ci, oxlint, tsc + vite build
│   └── datadog-synthetics.yml              # Guarded Datadog E2E workflow (runs when secrets set)
├── public/
│   ├── favicon.svg                         # Fest shield SVG emblem
│   ├── footer-bg.jpg                       # AI-generated panoramic twilight footer illustration
│   └── gecs-campus.jpg                     # Authenticated GEC Sheikhpura campus hero image
├── server/
│   ├── app.ts                              # HTTP handler factory & production dist/ SPA static server
│   ├── index.ts                            # Server boot, WAL initialization & SIGINT/SIGTERM shutdown
│   ├── dev.mjs                             # Clean dual-process Node backend + Vite dev launcher
│   ├── config/
│   │   └── env.ts                          # .env loader & validated runtime configuration
│   ├── middleware/
│   │   ├── auth.ts                         # HMAC-SHA256 stateless admin tokens & constant-time PIN check
│   │   ├── rateLimit.ts                    # Sliding-window API & brute-force rate limiter
│   │   └── security.ts                     # Security headers, Request-Id tracing & structured logs
│   ├── db/
│   │   ├── schema.sql                      # 17-table relational SQLite schema + views & triggers
│   │   └── database.ts                     # Idempotent auto-seed, transactions & full CRUD analytics
│   ├── routes/
│   │   ├── helpers.ts                      # HttpError, JSON/CSV writers & strict field validators
│   │   ├── publicRoutes.ts                 # Catalog, registration, verification & inquiry endpoints
│   │   ├── adminRoutes.ts                  # Token/PIN-protected organizer CRUD & CSV export
│   │   └── api.ts                          # Central API dispatcher & middleware pipeline
│   └── tests/
│       └── api.test.ts                     # Built-in node:test backend API + SQLite test suite
└── src/
    ├── App.tsx                             # BrowserRouter routes (/, /home, /verify, /admin, *)
    ├── main.tsx                            # React StrictMode DOM mount
    ├── index.css                           # Tailwind directives, custom classes & marquee CSS
    ├── services/
    │   └── api.ts                          # Strongly typed frontend API client & DTOs
    ├── data/
    │   └── techySheikhpuraData.ts          # Seed baseline: 14 Events, 3 Pass Tiers, Schedule & FAQs
    ├── pages/
    │   ├── HomePage.tsx                    # Root route wrapper rendering TechySheikhpuraPage
    │   ├── TechySheikhpuraPage.tsx         # Master fest page hydrated from /api/fest
    │   ├── VerifyPassPage.tsx              # Public /verify QR pass verification portal
    │   ├── AdminDashboardPage.tsx          # PIN-gated /admin organizer console & check-in desk
    │   └── NotFoundPage.tsx                # 404 route with Home & Events anchor recovery
    └── components/
        ├── common/
        │   └── ParticleCanvas.tsx          # Standalone particle background utility
        └── techy/
            ├── CountdownTimer.tsx          # High-contrast HUD event countdown
            ├── DelegateQrSvg.tsx           # Deterministic 13x13 SVG QR badge component
            ├── EventDetailModal.tsx        # Event rules, prize & coordinator modal
            ├── HelpdeskSection.tsx         # Student support form persisted to /api/inquiries
            ├── PassBookingModal.tsx        # SQLite-backed booking form + offline fallback
            ├── TechyNavbar.tsx             # Sticky navbar with Verify Pass, Desk & CTA links
            └── TechyFooter.tsx             # AI twilight crowd footer with Team Hunter & Telegram
```

Rendered sections inside `TechySheikhpuraPage.tsx`:

1. **Navigation (`TechyNavbar`)** — Sticky header with brand mark, anchor links (`#hero`, `#about`, `#events`, `#passes`, `#schedule`), `Verify Pass`, `Desk`, and `Get Fest Pass` action.
2. **Hero & HUD (`#hero`, `CountdownTimer`)** — GEC Sheikhpura campus backdrop, quick stats grid, live DB-fed activity ticker, fest action triggers, and countdown timer to `Nov 28, 2026`.
3. **Marquee Ticker** — Continuous seamless double-track event highlights banner.
4. **About Section (`#about`)** — Innovation pillars and campus venue overview.
5. **Events Arena (`#events`)** — Category filter pills (`All` + 7 categories), keyword search input, SQLite-backed event cards, and `EventDetailModal` trigger.
6. **Passes & Clubs (`#passes`)** — 3 pass tiers (`₹149`, `₹29`, `₹199`) launching `PassBookingModal`, plus 5 GEC Sheikhpura student clubs.
7. **Schedule, FAQs & Helpdesk (`#schedule`, `#faqs`, `#contact`)** — Day 1 / Day 2 timeline toggle, FAQ accordion, and SQLite-backed Student Helpdesk form.
8. **Footer (`TechyFooter`)** — AI twilight crowd backdrop, Team Hunter attribution, Telegram channel pill, coordinator `tel:` links, and outlined `GEC SHEIKHPURA` backdrop typography.

---

## 4. Performance & Bundle Metrics

| Metric                        | Target         | Measured Result                                                                                      |
| ----------------------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| **Production Build Time**     | `< 2.5s`       | **1.50s** (`tsc -b && vite build`)                                                                   |
| **Gzip JS Bundle Size**       | `< 130 kB`     | **120.37 kB** (`411.70 kB` raw)                                                                      |
| **Gzip CSS Bundle Size**      | `< 12 kB`      | **7.86 kB** (`41.65 kB` raw)                                                                         |
| **Linter Diagnostic Output**  | `0 Warnings`   | **0 Warnings, 0 Errors** (`oxlint` default: 116 rules across 33 files; server strict: 154 rules)     |
| **Backend Integration Suite** | `All Pass`     | **4/4 Passing** (`node:test`: SQLite seed, pass/dup 409, inquiry, HMAC auth CRUD, CSV & rate limits) |
| **TypeScript Strict Mode**    | `0 Errors`     | **`strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`**   |
| **GitHub Actions CI**         | `Green Checks` | **`CI Build & Lint` passing on Node 24 (`lint`, `test`, `build`); Datadog Synthetics guarded**       |
