# Test Plan & Quality Assurance — TechySheikhpura '26

## 1. Functional Verification
- [ ] **Navigation Bar:**
  - Sticky glassmorphic behavior on scroll.
  - Links smoothly scroll to `#hero`, `#about`, `#events`, `#passes`, `#schedule`, `#faqs`.
  - "Get Fest Pass" button opens `PassBookingModal`.
  - Mobile hamburger menu opens and closes cleanly.
- [ ] **Hero Section:**
  - Campus image (`/gecs-campus.jpg`) loads crisp with dark overlay.
  - Title `Techy Sheikhpura '26` is dead-centered.
  - Countdown timer computes live remaining time to Nov 28, 2026.
- [ ] **Events Arena:**
  - Category filter pills filter events reactively.
  - Search bar filters events by title, description, or keyword in real-time.
  - "View Rules" button displays rules, prizes, and coordinator phone numbers.
- [ ] **Pass Booking:**
  - Pass selection (₹149 / ₹29 / ₹199) pre-selects correctly.
  - Form validation prevents empty submissions.
  - Submitting renders holographic pass card, QR code, and triggers confetti blast.
- [ ] **Schedule:**
  - Day 1 vs Day 2 switcher toggles time slots without page jump.

## 2. Responsive Viewport Matrix
- [ ] Mobile: 375px (iPhone SE)
- [ ] Large Mobile: 414px (iPhone Pro Max)
- [ ] Tablet: 768px (iPad)
- [ ] Laptop: 1024px / 1280px
- [ ] Desktop: 1440px / 1920px

## 3. Performance & Compilation
- [ ] `npm run lint` (`oxlint`) passes with 0 warnings.
- [ ] `npm run build` (`tsc -b && vite build`) passes with 0 errors.

