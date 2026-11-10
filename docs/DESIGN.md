# 🎨 Design System & Visual Guidelines

<div align="center">

# ⚡ TechVerse Aesthetic Specifications
**Visual Design Identity for TechySheikhpura '26**

---

[![Theme: Void #020003](https://img.shields.io/badge/Base_Theme-%23020003-black?style=for-the-badge)](docs/DESIGN.md)
[![Typography: Syne](https://img.shields.io/badge/Heading_Font-Syne-d45d8c?style=for-the-badge)](https://fonts.google.com/specimen/Syne)
[![Typography: Inter](https://img.shields.io/badge/Body_Font-Inter-61DAFB?style=for-the-badge)](https://fonts.google.com/specimen/Inter)

</div>

---

## 1. Design Philosophy

The design system for **TechySheikhpura '26** is directly modeled after the acclaimed **`https://techverse-dce.me/`** intra-college fest experience:
- **Pitch Midnight Void:** A deep `#020003` canvas with zero unnecessary brightness.
- **Glassmorphic Obsidian Cards:** Translucent dark cards (`#0b0b11`) with subtle white borders.
- **Radiant Ambient Glows:** Strategic radial highlights in fuchsia (`#d45d8c`), pink (`#ff8cb8`), and cyan (`#00f0ff`).
- **Geometric Typographic Impact:** High-impact Google Font **Syne** for headings, paired with **Inter** for clean readability.

---

## 2. Color Palette Specification

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  PITCH VOID     │ │  OBSIDIAN CARD  │ │ FUCHSIA ACCENT  │ │ RADIANT VIOLET  │
│    #020003      │ │    #0b0b11      │ │    #d45d8c      │ │    #e293e0      │
│  Base Canvas    │ │  Glass Cards    │ │  Glows & Badges │ │  Subtle Glow    │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

| Swatch | Token Name | Hex Code | RGB | Visual Usage |
|---|---|---|---|---|
| ⬛ | `bg-void` | `#020003` | `rgb(2, 0, 3)` | Primary body canvas & page background |
| 🪨 | `bg-card` | `#0b0b11` | `rgb(11, 11, 17)` | Surface background for cards and dialogs |
| 🌸 | `techverse-fuchsia` | `#d45d8c` | `rgb(212, 93, 140)` | Accent borders, countdown counters, CTAs |
| 🌺 | `techverse-pink` | `#ff8cb8` | `rgb(255, 140, 184)` | Gradient text highlights |
| 🔮 | `techverse-violet`| `#e293e0` | `rgb(226, 147, 224)` | Shimmer text transitions & glows |
| 💎 | `techverse-cyan`  | `#00f0ff` | `rgb(0, 240, 255)` | Secondary energy badge highlights |
| ⬜ | `text-pure-white` | `#ffffff` | `rgb(255, 255, 255)` | Primary titles & high-contrast headings |
| 🔘 | `text-slate-muted`| `#94a3b8` | `rgb(148, 163, 184)` | Body copy & secondary metadata |

---

## 3. Typography Hierarchy

```
DISPLAY (Syne)   ──>  TECHY SHEIKHPURA '26  (84px+ / ExtraBold)
SUB-TITLE (Syne) ──>  WHERE IDEAS MEET INNOVATION (24px / Bold / Tracking 0.14em)
SECTION HEAD (Syne)─> FEST EVENTS ARENA (36px–48px / Black)
BODY (Inter)     ──>  The flagship annual intra-college techno-cultural festival... (14px)
HUD DATA (Mono)  ──>  LOC: 25.1322° N, 85.8488° E • MEHUS, SHEIKHPURA (11px / SemiBold)
```

| Element | Font Family | Size (Mobile → Desktop) | Weight | Letter Spacing |
|---|---|---|---|---|
| **Hero Main Title** | `Syne` | `48px → 110px` | `900 (Black)` | `-0.02em` |
| **Hero Tagline** | `Syne` | `16px → 24px` | `700 (Bold)` | `0.14em` |
| **Section Headings** | `Syne` | `28px → 48px` | `800 (ExtraBold)` | `-0.01em` |
| **Card Headings** | `Syne` | `20px → 24px` | `700 (Bold)` | `Normal` |
| **Body Paragraphs** | `Inter` | `13px → 15px` | `400 (Regular)` | `Normal` |
| **Badges / Tickers** | `JetBrains Mono`| `10px → 12px` | `700 (Bold)` | `0.12em` |

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
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: transparent;
  -webkit-text-stroke: 2px rgb(116, 108, 116);
  filter: drop-shadow(0 0 20px rgba(215, 57, 255, 0.15));
}
```

---

## 5. Responsive Breakpoint Rules

- **Mobile (`< 640px`):** Single-column cards, hamburger navigation drawer, stacked action buttons, full-width touch targets.
- **Tablet (`640px – 1024px`):** 2-column event grid, 4-column stats row, responsive hero countdown.
- **Desktop (`> 1024px`):** 3-column event grid, sticky glassmorphic navbar with full menu, expansive countdown timer with cyber brackets.
