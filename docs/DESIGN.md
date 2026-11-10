# Design System — TechySheikhpura '26

## 1. Aesthetic Direction
- **Inspiration:** `https://techverse-dce.me/`
- **Visual Style:** Pitch Midnight Void (`#020003`), Obsidian glassmorphic cards (`#0b0b11`), glowing fuchsia & magenta accents, and Syne typography.

---

## 2. Color Palette
| Token | Hex Value | Usage |
|---|---|---|
| Background Void | `#020003` | Primary body and page background |
| Obsidian Card | `#0b0b11` | Glassmorphic card surface |
| TechVerse Fuchsia | `#d45d8c` | Glows, active badges, and highlights |
| TechVerse Pink | `#ff8cb8` | Gradient text transitions |
| TechVerse Violet | `#e293e0` | Subtle ambient lighting |
| Electric Cyan | `#00f0ff` | Secondary energy accent |
| Pure White | `#ffffff` | Primary headings & high-contrast titles |
| Slate Muted | `#94a3b8` | Body descriptions and metadata |

---

## 3. Typography
- **Display Headings (`font-display`):** `Syne`, sans-serif (Weights: 700, 800, 900)
- **Body & Controls (`font-sans`):** `Inter`, sans-serif (Weights: 400, 500, 600)
- **HUD & Technical Data (`font-mono`):** `JetBrains Mono`, monospace

---

## 4. UI Components & Tokens
- **Glassmorphism Cards:**
  ```css
  background: rgba(11, 11, 17, 0.78);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  ```
- **Outlined Text (Footer `GEC SHEIKHPURA`):**
  ```css
  -webkit-text-stroke: 2px rgb(116, 108, 116);
  filter: drop-shadow(0 0 20px rgba(215, 57, 255, 0.15));
  ```
- **CTAs & Action Buttons:**
  - Gradient Primary: `bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold`
  - Glass Secondary: `bg-white/10 hover:bg-white/20 border border-white/25 text-white`
