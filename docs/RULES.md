# Development & Coding Rules — TechySheikhpura '26

## 1. General Rules
- Always use strict TypeScript. No implicit `any` types.
- Maintain documentation integrity (`docs/`).
- Never delete or bypass user constraints.
- Re-use existing components and utilities rather than duplicating code.
- Keep components modular and single-responsibility.

## 2. Before Coding
- Review `docs/PRD.md`, `docs/ARCHITECTURE.md`, and `docs/DESIGN.md`.
- Inspect existing files before editing.
- Formulate a clean plan before large modifications.

## 3. UI & Design Rules
- All colors and styling must strictly match `docs/DESIGN.md` (Background `#020003`, fonts `Syne` and `Inter`).
- Every interactive element (button, link, tab) must have smooth hover and focus states.
- Mobile responsiveness is mandatory (375px, 768px, 1024px, 1440px).

## 4. Verification Workflow
- After every feature or bugfix:
  1. Run `npm run lint` (or `oxlint`) — ensure 0 warnings and 0 errors.
  2. Run `npm run build` (`tsc -b && vite build`) — ensure clean bundle output.
  3. Verify Hot Module Replacement (HMR) on the dev server.
