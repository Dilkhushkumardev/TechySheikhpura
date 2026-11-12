# Engineering & Development Rules

> **Vibe Coding Protocol** — Strict Operational Constraints for TechySheikhpura '26.

[![Lint: Oxlint](https://img.shields.io/badge/Lint-Oxlint_Clean-10B981?style=for-the-badge)](RULES.md)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6?style=for-the-badge)](https://www.typescriptlang.org/)
[![Git: Version Controlled](https://img.shields.io/badge/VCS-Git_Enabled-F05032?style=for-the-badge)](https://git-scm.com/)

---

## 1. Core Engineering Commandments

> [!IMPORTANT]
> The following rules must be followed across all code additions, edits, and refactors in the TechySheikhpura project.

1. **Strict TypeScript Compliance:**
   - Enable `strict`, `verbatimModuleSyntax`, `noUnusedLocals`, and `noUnusedParameters` in `tsconfig.app.json`.
   - Zero `any` types permitted. Define explicit interfaces for all domain models (`BookedPassData`, `FestEvent`, `FestPass`, `ScheduleItem`) and browser extensions.
   - Always use `import type` when importing interfaces or types.
2. **Design Integrity:**
   - Adhere strictly to `#020003` background, `#0b0b11` cards, fuchsia/purple accents, and `Syne` / `Inter` typography defined in [`DESIGN.md`](DESIGN.md).
   - Never leave stale cyan/navy modal overrides or non-standard CSS utility classes.
3. **Preserve User Constraints:**
   - Identity must remain **Government Engineering College, Sheikhpura (GEC Sheikhpura)** and **TechySheikhpura '26**.
   - Hero background image must remain the authentic Administrative Block (`/gecs-campus.jpg`).
   - Footer must strictly maintain the TechVerse crowd illustration (`/footer-bg.png`) with outlined `GEC SHEIKHPURA` typography.
   - Do not add a Google Maps embed back into the layout.

---

## 2. Professional Vibe Coding Workflow

Follow the 9-step development loop for every feature or modification:

```mermaid
flowchart LR
    A["1. READ"] --> B["2. UNDERSTAND"]
    B --> C["3. PLAN"]
    C --> D["4. IMPLEMENT"]
    D --> E["5. TEST"]
    E --> F["6. REVIEW"]
    F --> G["7. FIX"]
    G --> H["8. COMMIT"]
    H --> I["9. UPDATE DOCS"]
```

---

## 3. Code Standards & Architecture Patterns

### Component Architecture

- Components must live in `src/components/techy/` or `src/components/common/`.
- Pages must live in `src/pages/`.
- Data constants and domain structures belong exclusively in `src/data/techySheikhpuraData.ts`.
- Never write direct DOM manipulation or unguarded `localStorage` JSON parsing inside render bodies.

### Safe Audio Synthesis

- Reuse a single `AudioContext` ref per session to stay under browser hardware limits and close it cleanly on unmount.
- Always wrap `AudioContext` inside `try-catch` blocks to handle mobile browser autoplay policies.
- Ramp oscillator gain down to `0.001` before calling `.stop()` to eliminate audible speaker clicks.

---

## 4. Verification & QA Protocol

Before declaring any task complete:

```bash
# 1. Run Oxlint for zero warnings and zero errors
npm run lint

# 2. Run strict TypeScript compiler and production build
npm run build
```

Both commands must exit with code `0`.
