import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Master Vector SVG Logo (public/logo.svg)
# ---------------------------------------------------------------------------
LOGO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e0417"/>
      <stop offset="50%" stop-color="#06020c"/>
      <stop offset="100%" stop-color="#030008"/>
    </linearGradient>

    <!-- Primary Neon Gradient (Fuchsia to Violet to Cyan) -->
    <linearGradient id="primaryNeon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff1b8d"/>
      <stop offset="45%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#00f2fe"/>
    </linearGradient>

    <!-- Border Glow Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2a85"/>
      <stop offset="50%" stop-color="#c026d3"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>

    <!-- Accent Fuchsia Gradient -->
    <linearGradient id="fuchsiaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff3b9a"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>

    <!-- Accent Cyan Gradient -->
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>

    <!-- Core Radial Glow -->
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff1b8d" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#a855f7" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#00f2fe" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft Ambient Halo -->
    <radialGradient id="ambientHalo" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#ff1b8d" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Glow Filter -->
    <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Ambient Backdrop Glow -->
  <circle cx="256" cy="240" r="210" fill="url(#ambientHalo)" />

  <!-- Outer Cyber Shield Body -->
  <path d="M 256,38 L 442,108 L 442,284 C 442,374 346,446 256,474 C 166,446 70,374 70,284 L 70,108 Z"
        fill="url(#shieldBg)"
        stroke="url(#borderGrad)"
        stroke-width="7"
        stroke-linejoin="round"
        filter="url(#neonFilter)"/>

  <!-- Inner Tech Inset Contour -->
  <path d="M 256,58 L 420,120 L 420,274 C 420,352 334,420 256,446 C 178,420 92,352 92,274 L 92,120 Z"
        fill="none"
        stroke="#ffffff"
        stroke-opacity="0.12"
        stroke-width="2"
        stroke-dasharray="14 8"/>

  <!-- Circuit Trace: Top Left -->
  <path d="M 172,165 L 126,132 L 102,132"
        fill="none"
        stroke="#00f2fe"
        stroke-width="3"
        stroke-linecap="round"/>
  <circle cx="102" cy="132" r="5" fill="#00f2fe" />
  <circle cx="102" cy="132" r="9" fill="none" stroke="#00f2fe" stroke-width="1.5" stroke-opacity="0.6"/>

  <!-- Circuit Trace: Top Right -->
  <path d="M 340,165 L 386,132 L 410,132"
        fill="none"
        stroke="#ff2a85"
        stroke-width="3"
        stroke-linecap="round"/>
  <circle cx="410" cy="132" r="5" fill="#ff2a85" />
  <circle cx="410" cy="132" r="9" fill="none" stroke="#ff2a85" stroke-width="1.5" stroke-opacity="0.6"/>

  <!-- Circuit Trace: Bottom Nodes -->
  <path d="M 256,396 L 256,428"
        fill="none"
        stroke="#00f2fe"
        stroke-width="3"
        stroke-linecap="round"/>
  <circle cx="256" cy="428" r="4.5" fill="#00f2fe" />

  <!-- Central Radial Core -->
  <circle cx="256" cy="245" r="95" fill="url(#coreGlow)" />

  <!-- Monogram Glyph: "T" Crossbar & Wing Terminals -->
  <path d="M 152,154 L 360,154 L 372,176 L 350,192 L 162,192 L 140,176 Z"
        fill="url(#fuchsiaGrad)"
        stroke="#ffffff"
        stroke-width="1.5"
        stroke-opacity="0.3"/>

  <!-- "T" Central Spine & Interlocking "S" Ribbon -->
  <!-- Top half of S loop -->
  <path d="M 344,204 C 344,196 312,192 256,192 C 198,192 170,224 170,252 C 170,286 216,298 266,308 C 322,319 346,336 346,368 C 346,406 304,424 256,424 C 204,424 168,402 166,378 L 206,370 C 208,382 226,394 256,394 C 286,394 306,382 306,366 C 306,346 276,338 232,328 C 182,316 130,298 130,252 C 130,204 182,166 256,166 C 316,166 352,194 352,220 Z"
        fill="url(#primaryNeon)"
        stroke="#ffffff"
        stroke-width="1.5"
        stroke-opacity="0.4"
        filter="url(#neonFilter)"/>

  <!-- Quantum Core Spark (4-Pointed Star Nexus at Center) -->
  <path d="M 256,208 Q 256,238 286,238 Q 256,238 256,268 Q 256,238 226,238 Q 256,238 256,208 Z"
        fill="#ffffff"
        filter="url(#neonFilter)"/>
  <circle cx="256" cy="238" r="4.5" fill="#00f2fe" />

  <!-- Micro GECS Brand Tag at Base -->
  <g transform="translate(256, 452)">
    <rect x="-38" y="-12" width="76" height="18" rx="6" fill="#0b0614" stroke="#a855f7" stroke-width="1.2" stroke-opacity="0.6"/>
    <text x="0" y="1" font-family="'JetBrains Mono', 'Segoe UI', monospace" font-size="10.5" font-weight="900" fill="#e2e8f0" text-anchor="middle" letter-spacing="3.5">GECS</text>
  </g>
</svg>
"""

# ---------------------------------------------------------------------------
# 2. Optimized Browser Tab Favicon SVG (public/favicon.svg)
# ---------------------------------------------------------------------------
FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="favShieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#140624"/>
      <stop offset="100%" stop-color="#05010a"/>
    </linearGradient>
    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff1b8d"/>
      <stop offset="50%" stop-color="#c026d3"/>
      <stop offset="100%" stop-color="#00f2fe"/>
    </linearGradient>
  </defs>

  <!-- Shield Body -->
  <path d="M 32,4 L 58,14 L 58,36 C 58,48 45,57 32,61 C 19,57 6,48 6,36 L 6,14 Z"
        fill="url(#favShieldBg)"
        stroke="url(#favGrad)"
        stroke-width="2.5"
        stroke-linejoin="round"/>

  <!-- "T" Crossbar -->
  <path d="M 18,19 L 46,19 L 44,24 L 20,24 Z"
        fill="#ff2a85"/>

  <!-- "S" Stylized Monogram Ribbon -->
  <path d="M 43,26 C 43,23 37,22 32,22 C 24,22 21,26 21,30 C 21,35 27,37 34,39 C 41,41 44,43 44,47 C 44,52 38,55 32,55 C 25,55 20,52 20,48 L 25,47 C 25,49 28,51 32,51 C 36,51 39,49 39,47 C 39,44 34,43 28,41 C 21,39 16,36 16,30 C 16,24 23,19 32,19 C 40,19 44,23 44,26 Z"
        fill="url(#favGrad)"/>

  <!-- Core Pulse Star -->
  <circle cx="32" cy="35" r="2.5" fill="#ffffff"/>
  <circle cx="32" cy="35" r="1.2" fill="#00f2fe"/>
</svg>
"""

with open(os.path.join(OUTPUT_DIR, 'logo.svg'), 'w', encoding='utf-8') as f:
    f.write(LOGO_SVG.strip())

with open(os.path.join(OUTPUT_DIR, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(FAVICON_SVG.strip())

print("Saved logo.svg and favicon.svg successfully.")

# ---------------------------------------------------------------------------
# 3. High-Resolution Raster Generation (Pillow)
# ---------------------------------------------------------------------------
def draw_master_logo(size=512):
    """Draws the crisp, anti-aliased official logo icon using PIL primitives."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    scale = size / 512.0
    def s(val): return val * scale
    def pt(x, y): return (s(x), s(y))

    # Outer Halo glow
    glow_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_center = (s(256), s(240))
    glow_r = s(180)
    glow_draw.ellipse([glow_center[0]-glow_r, glow_center[1]-glow_r, glow_center[0]+glow_r, glow_center[1]+glow_r],
                      fill=(168, 85, 247, 90))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=s(35)))
    img = Image.alpha_composite(img, glow_img)
    draw = ImageDraw.Draw(img)

    # Shield vertices
    shield_pts = [
        pt(256, 38),
        pt(442, 108),
        pt(442, 284),
        pt(380, 360),
        pt(320, 420),
        pt(256, 474),
        pt(192, 420),
        pt(132, 360),
        pt(70, 284),
        pt(70, 108),
    ]

    # Draw dark shield fill
    draw.polygon(shield_pts, fill=(11, 4, 19, 255))

    # Gradient border on shield (emulated by drawing concentric polygons)
    for i in range(int(s(6)), 0, -1):
        color = (
            int(255 - (i * 12)),
            int(42 + (i * 25)),
            int(133 + (i * 18)),
            255
        )
        draw.polygon(shield_pts, outline=color, width=i)

    # Inner dashed line contour
    inner_pts = [
        pt(256, 60),
        pt(420, 122),
        pt(420, 274),
        pt(362, 344),
        pt(308, 398),
        pt(256, 444),
        pt(204, 398),
        pt(150, 344),
        pt(92, 274),
        pt(92, 122),
    ]
    draw.polygon(inner_pts, outline=(255, 255, 255, 35), width=int(max(1, s(2))))

    # Top Left Circuit
    draw.line([pt(172, 165), pt(126, 132), pt(102, 132)], fill=(0, 242, 254, 255), width=int(max(2, s(3))))
    draw.ellipse([s(96), s(126), s(108), s(138)], fill=(0, 242, 254, 255))

    # Top Right Circuit
    draw.line([pt(340, 165), pt(386, 132), pt(410, 132)], fill=(255, 42, 133, 255), width=int(max(2, s(3))))
    draw.ellipse([s(404), s(126), s(416), s(138)], fill=(255, 42, 133, 255))

    # Bottom Node
    draw.line([pt(256, 396), pt(256, 428)], fill=(0, 242, 254, 255), width=int(max(2, s(3))))
    draw.ellipse([s(251), s(423), s(261), s(433)], fill=(0, 242, 254, 255))

    # "T" Crossbar
    t_bar = [
        pt(152, 154),
        pt(360, 154),
        pt(372, 176),
        pt(350, 192),
        pt(162, 192),
        pt(140, 176),
    ]
    draw.polygon(t_bar, fill=(255, 42, 133, 255), outline=(255, 255, 255, 100), width=int(max(1, s(1.5))))

    # Draw Monogram Ribbon Curves ("S")
    s_pts = [
        pt(344, 204),
        pt(290, 192),
        pt(240, 192),
        pt(180, 218),
        pt(168, 252),
        pt(190, 282),
        pt(240, 296),
        pt(290, 310),
        pt(342, 332),
        pt(346, 368),
        pt(320, 404),
        pt(260, 424),
        pt(190, 412),
        pt(166, 378),
        pt(206, 370),
        pt(224, 388),
        pt(260, 394),
        pt(296, 384),
        pt(306, 366),
        pt(290, 348),
        pt(244, 334),
        pt(190, 320),
        pt(146, 296),
        pt(130, 252),
        pt(148, 204),
        pt(204, 170),
        pt(260, 166),
        pt(316, 174),
        pt(352, 210),
    ]
    draw.polygon(s_pts, fill=(168, 85, 247, 255), outline=(0, 242, 254, 220), width=int(max(1, s(2))))

    # Core Quantum Star
    star_pts = [
        pt(256, 212),
        pt(264, 230),
        pt(284, 238),
        pt(264, 246),
        pt(256, 264),
        pt(248, 246),
        pt(228, 238),
        pt(248, 230),
    ]
    draw.polygon(star_pts, fill=(255, 255, 255, 255))
    draw.ellipse([s(252), s(234), s(260), s(242)], fill=(0, 242, 254, 255))

    # GECS pill at bottom
    pill_box = [s(218), s(440), s(294), s(458)]
    draw.rounded_rectangle(pill_box, radius=s(6), fill=(14, 6, 24, 255), outline=(168, 85, 247, 180), width=int(max(1, s(1.5))))
    return img

# Generate Master 512x512 logo
master_logo = draw_master_logo(512)
master_logo.save(os.path.join(OUTPUT_DIR, 'logo.png'), 'PNG')
print("Saved public/logo.png")

# Generate standard icon sizes
sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-48x48.png': 48,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

for filename, sz in sizes.items():
    resized = master_logo.resize((sz, sz), Image.Resampling.LANCZOS)
    resized.save(os.path.join(OUTPUT_DIR, filename), 'PNG')
    print(f"Saved public/{filename}")

# Generate multi-size ICO file
ico_sizes = [(16, 16), (32, 32), (48, 48)]
master_logo.save(os.path.join(OUTPUT_DIR, 'favicon.ico'), format='ICO', sizes=ico_sizes)
print("Saved public/favicon.ico")

# ---------------------------------------------------------------------------
# 4. OpenGraph Social & Google Search Preview Banner (1200 x 630 px)
# ---------------------------------------------------------------------------
def generate_og_image():
    W, H = 1200, 630
    og = Image.new('RGBA', (W, H), (3, 0, 6, 255))
    draw = ImageDraw.Draw(og)

    # Ambient Glow Orbs
    glow1 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d1 = ImageDraw.Draw(glow1)
    d1.ellipse([40, -100, 600, 460], fill=(255, 42, 133, 50))
    glow1 = glow1.filter(ImageFilter.GaussianBlur(radius=80))

    glow2 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d2 = ImageDraw.Draw(glow2)
    d2.ellipse([700, 150, 1300, 750], fill=(168, 85, 247, 45))
    glow2 = glow2.filter(ImageFilter.GaussianBlur(radius=90))

    og = Image.alpha_composite(og, glow1)
    og = Image.alpha_composite(og, glow2)
    draw = ImageDraw.Draw(og)

    # Subtle Tech Grid Pattern
    for x in range(0, W, 40):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, H, 40):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 6), width=1)

    # Composite official emblem on left (380x380)
    emblem_380 = master_logo.resize((380, 380), Image.Resampling.LANCZOS)
    og.paste(emblem_380, (70, 125), emblem_380)

    # Right Content Area:
    # Top Tag: GEC SHEIKHPURA PRESENTS
    draw.rounded_rectangle([490, 120, 940, 154], radius=17, fill=(15, 6, 25, 230), outline=(255, 42, 133, 140), width=1)

    # Typography & Information
    try:
        font_tag = ImageFont.truetype("arialbd.ttf", 15)
        font_title_large = ImageFont.truetype("arialbd.ttf", 64)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_date = ImageFont.truetype("arialbd.ttf", 22)
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
    except Exception:
        font_tag = ImageFont.load_default()
        font_title_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_date = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    draw.text((515, 128), "GOVERNMENT ENGINEERING COLLEGE, SHEIKHPURA", font=font_tag, fill=(240, 240, 255, 255))

    # Main Brand Headline
    draw.text((490, 175), "Techy Sheikhpura", font=font_title_large, fill=(255, 255, 255, 255))
    draw.text((1060, 175), "'26", font=font_title_large, fill=(255, 42, 133, 255))

    # Tagline
    draw.text((495, 260), "Flagship Technical & Innovation Festival of GEC Sheikhpura", font=font_sub, fill=(212, 180, 255, 255))

    # Event Stats Badges
    badges = [
        ("14+ Tech Arenas", (255, 42, 133)),
        ("₹10,000+ Cash Pool", (16, 185, 129)),
        ("Hackathons & Robotics", (0, 242, 254)),
    ]
    cur_x = 495
    for b_text, b_color in badges:
        bw = len(b_text) * 11 + 24
        draw.rounded_rectangle([cur_x, 320, cur_x + bw, 360], radius=10, fill=(18, 8, 30, 220), outline=(*b_color, 160), width=1)
        draw.text((cur_x + 12, 330), b_text, font=font_badge, fill=(*b_color, 255))
        cur_x += bw + 15

    # Bottom Date & Venue Card
    draw.rounded_rectangle([495, 400, 1120, 480], radius=16, fill=(12, 5, 20, 240), outline=(255, 255, 255, 40), width=1)
    draw.text((520, 416), "DATES: September 28 - 29, 2026", font=font_date, fill=(255, 255, 255, 255))
    draw.text((520, 446), "VENUE: GEC Sheikhpura Campus, Mehus, Bihar (Event Concluded)", font=font_tag, fill=(217, 70, 239, 255))

    # Border Glow on outer image
    draw.rectangle([0, 0, W-1, H-1], outline=(255, 42, 133, 100), width=3)

    og_rgb = og.convert('RGB')
    og_rgb.save(os.path.join(OUTPUT_DIR, 'og-image.png'), 'PNG', quality=95)
    print("Saved public/og-image.png (1200x630)")

generate_og_image()

# ---------------------------------------------------------------------------
# 5. site.webmanifest for PWA & Google Android/Search
# ---------------------------------------------------------------------------
MANIFEST_JSON = """{
  "name": "Techy Sheikhpura '26",
  "short_name": "TechySheikhpura",
  "description": "The flagship annual techno-cultural and innovation festival of Government Engineering College, Sheikhpura.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#020003",
  "theme_color": "#020003",
  "icons": [
    {
      "src": "/favicon-48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
"""

with open(os.path.join(OUTPUT_DIR, 'site.webmanifest'), 'w', encoding='utf-8') as f:
    f.write(MANIFEST_JSON.strip())

print("Saved public/site.webmanifest")

