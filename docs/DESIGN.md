# Design System & Visual Guidelines

> **Visual Aesthetic Specifications** — Midnight Cyber Design Identity for TechySheikhpura '26 at Government Engineering College, Sheikhpura.

[![Theme: Void #020003](https://img.shields.io/badge/Base_Theme-%23020003-black?style=for-the-badge)](DESIGN.md)
[![Typography: Oxanium](https://img.shields.io/badge/Heading_Font-Oxanium-d45d8c?style=for-the-badge)](https://fonts.google.com/specimen/Oxanium)
[![Typography: Plus Jakarta Sans](https://img.shields.io/badge/Body_Font-Plus_Jakarta_Sans-61DAFB?style=for-the-badge)](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

---

## 1. Design Philosophy

The design system for **TechySheikhpura '26** establishes a cohesive pitch-midnight engineering festival experience for GEC Sheikhpura:

- **Pitch Midnight Void:** A deep `#020003` canvas with minimal visual noise.
- **Glassmorphic Obsidian Cards:** Translucent dark cards (`#0b0b11`) with subtle crisp borders.
- **Radiant Ambient Glows:** Strategic radial highlights in fuchsia (`#d45d8c`), pink (`#ff8cb8`), and violet (`#e293e0`).
- **Geometric Typographic Impact:** Google Font **Oxanium** (`500–800`) for flagship display titles and outlined footer branding, **Space Grotesk** (`500–700`) for UI subheadings, **Barlow Condensed** (`500–700`) for condensed footer/label strips, **Plus Jakarta Sans** (`400–800`) for readable body copy, and **JetBrains Mono** for HUD telemetry.

---

## 2. Color Palette Specification

```text
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  PITCH VOID     │ │  OBSIDIAN CARD  │ │ FUCHSIA ACCENT  │ │ RADIANT VIOLET  │
│    #020003      │ │    #0b0b11      │ │    #d45d8c      │ │    #e293e0      │
│  Base Canvas    │ │  Glass Cards    │ │  Glows & Badges │ │  Subtle Glow    │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

| Swatch | Token Name | Hex Code | RGB | Visual Usage |
|---|---|---|---|---|
| Void | `bg-void` | `#020003` | `rgb(2, 0, 3)` | Primary body canvas & page background |
| Obsidian | `bg-card` | `#0b0b11` | `rgb(11, 11, 17)` | Surface background for cards and modals |
| Fuchsia | `accent-fuchsia` | `#d45d8c` | `rgb(212, 93, 140)` | Accent borders, countdown accents, CTAs |
| Pink | `accent-pink` | `#ff8cb8` | `rgb(255, 140, 184)` | Gradient text highlights |
| Violet | `accent-violet` | `#e293e0` | `rgb(226, 147, 224)` | Shimmer text transitions & glows |
| White | `text-pure-white` | `#ffffff` | `rgb(255, 255, 255)` | Primary titles & high-contrast headings |
| Slate | `text-slate-muted` | `#94a3b8` | `rgb(148, 163, 184)` | Body copy & secondary metadata |

---

## 3. Typography Hierarchy

```text
DISPLAY (Oxanium)        -->  TECHY SHEIKHPURA '26  (84px+ / Bold-ExtraBold)
SUB-TITLE (Oxanium)      -->  WHERE IDEAS MEET INNOVATION (24px / Bold / Tracking 0.14em)
SECTION HEAD (Oxanium)   -->  FEST EVENTS ARENA (36px–48px / Bold-Black)
CONDENSED (Barlow Cond.) -->  MADE WITH TEAM HUNTER FROM GEC SHEIKHPURA
BODY (Plus Jakarta Sans) -->  The flagship annual intra-college techno-cultural festival... (14px)
HUD DATA (Mono)          -->  LOC: 25.1322° N, 85.8488° E • MEHUS, SHEIKHPURA (11px / Bold)
```

| Element | Font Family | Size (Mobile to Desktop) | Weight | Letter Spacing |
|---|---|---|---|---|
| **Hero Main Title** | `Oxanium` | `48px -> 108px` | `800 (ExtraBold)` | `-0.01em` |
| **Hero Tagline** | `Oxanium` | `16px -> 24px` | `700 (Bold)` | `0.14em` |
| **Section Headings** | `Oxanium` | `30px -> 48px` | `800 (ExtraBold)` | `-0.01em` |
| **Card Headings** | `Space Grotesk` | `20px -> 24px` | `700 (Bold)` | `-0.015em` |
| **Footer Credits / Pills** | `Barlow Condensed` | `16px -> 24px` | `600 (SemiBold)` | `0.16em` |
| **Body Paragraphs** | `Plus Jakarta Sans` | `12px -> 15px` | `400–600` | `Normal` |
| **Badges / Tickers** | `JetBrains Mono` | `10px -> 12px` | `700 (Bold)` | `0.12em` |

---

## 4. Component Anatomy & Styling Tokens

### Glassmorphism Card Anatomy

```css
.glass-card {
  background: rgba(11, 11, 17, 0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-card:hover {
  border-color: rgba(226, 147, 224, 0.5);
  box-shadow: 0 12px 40px -10px rgba(212, 93, 140, 0.35);
  transform: translateY(-3px);
}
```

### Signature Outlined Bottom Typography (`GEC SHEIKHPURA`)

```css
.outlined-institution-text {
  font-family: 'Oxanium', 'Space Grotesk', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: transparent;
  -webkit-text-stroke: 2px rgb(116, 108, 116);
  filter: drop-shadow(0 0 20px rgba(215, 57, 255, 0.1));
}
```

---

## 5. Responsive Breakpoint Rules

- **Mobile (`< 640px`):** Single-column cards, hamburger navigation drawer, stacked action buttons, full-width touch targets.
- **Tablet (`640px - 1024px`):** 2-column event grid, 4-column stats row, responsive hero countdown.
- **Desktop (`> 1024px`):** 3-column event grid, sticky glassmorphic navbar with full menu, expansive countdown timer.
