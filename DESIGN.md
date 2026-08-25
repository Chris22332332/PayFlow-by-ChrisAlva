# Design Brief

## Direction

Premium Modern Fintech — a trustworthy, high-contrast digital wallet and P2P payments interface built on refined minimalism and professional clarity.

## Tone

Refined minimalism without corporate stiffness. High-contrast typography and interactive elements, minimal decoration, zero playfulness. Trust through precision.

## Differentiation

Cool teal primary accent (tech-forward, trustworthy) paired with warm amber CTAs and slate backgrounds — fintech standard shifted by color choice and intentional structural elevation.

## Color Palette

| Token      | OKLCH           | Role                                 |
| ---------- | --------------- | ------------------------------------ |
| background | 0.12 0.01 260   | Dark slate, minimal noise            |
| foreground | 0.92 0.015 260  | High-contrast light text             |
| card       | 0.17 0.01 260   | Elevated surface for content         |
| primary    | 0.72 0.18 190   | Teal accent, trustworthy             |
| accent     | 0.75 0.15 55    | Warm amber for CTAs                  |
| muted      | 0.22 0.015 260  | Secondary interactive zones          |
| destructive| 0.55 0.2 25     | Red for high-stakes actions          |
| success    | 0.65 0.18 150   | Green for confirmations (NEW)        |
| warning    | 0.65 0.2 70     | Orange for pending/caution (NEW)     |

## Typography

- Display: Space Grotesk — geometric, tech-forward confidence for headlines
- Body: DM Sans — clean, highly legible, professional labels and copy
- Mono: Geist Mono — transaction IDs, amounts, data fields
- Scale: hero `text-hero` (4xl–6xl bold), section `text-heading` (2xl–4xl bold), label `text-label` (xs semibold uppercase)

## Elevation & Depth

Elevation via lightness and border/shadow only. No soft drop-shadows. Cards elevated 50L above background. Minimal visual noise — borders only on key interactive boundaries.

## Structural Zones

| Zone              | Background  | Border           | Notes                                           |
| ----------------- | ----------- | ---------------- | ----------------------------------------------- |
| Header            | card        | border           | Fixed, contains nav + toggle                    |
| Content           | background  | —                | Main dashboard, spacious                        |
| Card              | card        | subtle border    | Transaction items, balance, settings sections  |
| Input             | 0.28        | ring on focus    | High-contrast borders, Stripe embed area        |
| Footer            | muted/30    | border           | Fixed or sticky actions, confirmations         |
| Currency Pills    | muted/40    | border           | Inline horizontal wallet display (USD/EUR/GBP/CAD/AUD/JPY) |
| Tax Breakdown     | muted/20    | —                | Nested in transaction rows (base + tax lines)  |
| Settings Grid     | card        | border           | 8 section cards (3-col grid on lg)              |
| Verification Badge| muted       | dynamic color    | Pending (muted), Verified (primary), Failed (destructive) |
| Session Card      | card        | subtle border    | Device info + IP + last active timestamp        |
| Receipt Modal     | card        | border           | Centered overlay, teal accent button            |

## Spacing & Rhythm

Compact-to-balanced density. Dashboard sections: 24px gap. Card rows: 16px gap. Micro-spacing: 8px increments. High information density for financial data, not crowded.

## Component Patterns

- Buttons: Rounded 8px, accent-colored (warm amber) for primary, muted for secondary, `transition-smooth` on all interactive
- Cards: 8px radius, card background, subtle border, no shadow (elevation via color only)
- Badges: Currency pills (6px radius, muted), Verification states (6px radius, dynamic color: pending/verified/failed)
- Tax Breakdown: Base amount (text-sm muted), tax amount (text-xs accent warm amber, font-mono)
- Settings Icons: 10×10 grid in 40px muted/50 container, rounded-lg
- Session Cards: Device name (font-semibold) + OS + IP (text-xs mono muted), last active timestamp
- Modals: Soft overlay (50% opacity), card surface centered, border-ring on focus, primary accent confirm button

## Motion

- Entrance: No decorative animations; focus entrance on modals (slide-up 200ms ease-out), toast (fade-in 150ms), receipt modal (scale-in 150ms)
- Hover: `transition-smooth` on all interactive elements, 8% lightness lift on cards, 10% chroma increase on teal/amber accent
- Currency Pills: Subtle highlight on hover (muted/50 → muted/60 bg)
- Verification Badge Pulse: Optional subtle pulse (1s loop) on pending status only
- Decorative: None — financial data presentation requires stability and clarity over whimsy

## Constraints

- No full-page gradients or ambient effects
- No playful animations or bounce effects
- High contrast >= 0.7 lightness difference foreground-on-background in both modes
- Token-only styling — no arbitrary color classes
- Minimum touch target: 44px diameter
- Mobile-first responsive design (sm, md, lg breakpoints)

## Signature Detail

Structural zone distinction via OKLCH lightness only (no borders on every surface) — creates clean, grid-like perception while maintaining clear hierarchy. Multi-currency wallets rendered as pill clusters with muted backgrounds for rapid scanning. Tax breakdowns nested inline on transactions (warm amber accent for tax amount, mono font for precision). Verification states signaled via dynamic badge color (pending/verified/failed) without decorative icons — color alone conveys status. Fintech clarity achieved through restraint, not color-flooded UI.

## New Semantic Tokens (Phase Expansion)

- `--success` (0.65 0.18 150): Green for payment confirmations and successful verification
- `--warning` (0.65 0.2 70): Orange for pending states and caution indicators
- Currency Pills: `.badge-currency` — muted bg with border, uppercase label
- Tax Line: `.tax-line` — accent (warm amber) + mono font for tax amounts
- Verification Badges: `.badge-pending`, `.badge-verified`, `.badge-failed` — dynamic styling per state
- Settings Grid: `.settings-grid` — responsive 1-2-3 column layout (sm/lg)
- Session Meta: `.session-meta` — xs mono muted for device/IP/timestamp display
- Receipt Modal: `.receipt-amount` (3xl mono bold), `.receipt-breakdown` (muted/30 bg, nested rows)
