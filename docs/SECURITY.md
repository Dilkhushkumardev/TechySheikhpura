# Security Guidelines — TechySheikhpura '26

## 1. Secrets Management
- Never commit private keys, payment gateway secret keys, or service credentials into version control.
- All environment configurations must be specified via `.env.local` and mirrored as empty templates in `.env.example`.

## 2. Client-Side Input Sanitization
- Form inputs in `PassBookingModal.tsx` validate required fields before creating delegate passes.
- No direct `eval()` or un-sanitized `dangerouslySetInnerHTML` is used in the application.

## 3. Safe External Assets
- External image URLs are restricted to verified CDNs (Unsplash, official tech logos).
- Web Audio API oscillators are securely destroyed and ramped down to prevent audio clipping or memory leaks.
