# Kalaakaari — Creative Agency Portfolio

> A creative agency portfolio for Kalaakaari, New Delhi.
> Built with vanilla HTML · CSS · JS, powered by **Vite** for local development.

---

## 🚀 Getting Started

### 1. Install dependencies (one-time)

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Opens **http://localhost:3000** automatically with **hot reload** on file save.

### Other commands

```bash
npm run build    # Build for production → output in /dist
npm run preview  # Preview the production build locally
```

---

## 📁 Project Structure

```
kalaakaari-portfolio/
├── index.html               # Main portfolio page
├── delhi.html               # "Relive Delhi" GTA-style interactive map page
├── vite.config.js           # Vite config (multi-page, port 3000)
├── package.json
│
├── css/
│   ├── style.css            # Primary design system + all component styles
│   └── brutalist-inject.css # Legacy overrides — to be merged into style.css
│
├── js/
│   ├── main.js              # All page logic (nav, cursor, animations, forms)
│   ├── AnimatedList.js      # Industries animated list component
│   ├── MagnetLines.js       # Hero magnet line grid (cursor-reactive)
│   ├── TextPressure.js      # Variable-font pressure effect component
│   ├── CurvedLoop.js        # SVG curved text marquee component
│   └── TrueFocus.js         # Word-by-word blur/focus animation
│
└── assets/
    ├── favicon.svg
    └── images/
        ├── map_bg.png
        └── skyline_bg.png
```

---

## 🧰 External Dependencies (CDN — no install required)

| Library | Version | Used For |
|---|---|---|
| [GSAP](https://gsap.com) | 3.12.5 | FlowingMenu services hover animation |
| [Lenis](https://github.com/studio-freight/lenis) | 1.0.42 | Smooth scroll |
| [Leaflet](https://leafletjs.com) | 1.9.4 | Delhi page interactive map |
| Google Fonts | — | Bebas Neue · Cinzel · Plus Jakarta Sans · Noto Devanagari |
| Material Symbols | — | Arrow icon in hero CTA |

---

## 🎨 Design Tokens

Defined in `css/style.css` `:root`:

| Token | Value | Role |
|---|---|---|
| `--accent` | `#C8912E` | Amber gold — primary brand accent |
| `--bg` | `#0C0907` | Deepest dark background |
| `--text` | `#F0E4CC` | Primary text |
| `--font-display` | Bebas Neue | Headlines |
| `--font-serif` | Cinzel | Labels, eyebrows, subheadings |
| `--font` | Plus Jakarta Sans | Body copy |
| `--font-hindi` | Noto Sans Devanagari | All Devanagari script |

---

## ⚡ Pages

### `index.html` — Main Portfolio
- Fixed nav with bilingual logo + language toggle (EN ↔ हि)
- Brand Etymology side panel (click the logo)
- Hero with typewriter effect, MagnetLines decoration, and meta card
- Animated marquee, stats counters, Manifesto section
- FlowingMenu services (GSAP hover marquee reveal)
- Process steps, Industries AnimatedList, Bento grid portfolio
- Case studies work grid, Clients scrolling strip, Testimonials
- FAQ accordion, Contact form, Expanded footer with luxury seal

### `delhi.html` — Relive Delhi
- GTA V–style HUD with Leaflet dark map (CartoDB Dark Matter tiles)
- Custom GTA radar blip markers (main, vibe, temple, hub, HQ variants)
- Live coordinate display on mouse move
- 8 pinned Delhi locations with styled popup cards
- CRT scanlines + vignette overlay

---

## 🐛 Known Issues / Tech Debt

| # | Issue | Priority |
|---|---|---|
| 1 | `brutalist-inject.css` duplicates large chunks of `style.css` with a forked token naming (`--primary-container` vs `--accent`). Needs merging. | 🔴 High |
| 2 | Contact form simulates sending but never actually submits. Needs a real backend (e.g. [Formspree](https://formspree.io)). | 🔴 High |
| 3 | Social links in footer are placeholder `href="#"` — need real URLs. | 🔴 High |
| 4 | `--font-mono` CSS variable is referenced but never declared. Add `--font-mono: 'Space Mono', monospace;` to `:root`. | 🟡 Medium |
| 5 | Delhi page mobile burger has no open CSS state — broken on mobile. | 🟡 Medium |
| 6 | `AnimatedList` globally captures arrow keys, preventing keyboard page scroll. | 🟡 Medium |
| 7 | Hero background images hosted on external CDN (`lh3.googleusercontent.com`) — should be self-hosted. | 🟡 Medium |
| 8 | `TextPressure.js` and `CurvedLoop.js` are loaded but never instantiated. | 🟢 Low |
| 9 | Copyright year says `2025` in both pages. | 🟢 Low |
| 10 | No `<meta description>` or Open Graph tags — hurts SEO and social link previews. | 🟢 Low |

---

## 🗺 Development Roadmap

### Now — Vite + Vanilla ✅
Vite provides a proper dev server, hot reload, and a production build pipeline without changing the tech stack. All existing JS components work unchanged.

### Next — Merge CSS Architecture
Consolidate `style.css` and `brutalist-inject.css` into one unified file with a single token naming convention. Eliminates the 40+ `!important` overrides.

### Future — Migrate to [Astro](https://astro.build)
When the project needs:
- A **blog** or editorial content section
- A **CMS** (e.g. Sanity, Contentful) for managing case studies, team, or client info without touching code — a CMS lets non-developers add/edit content through a web dashboard without opening any code
- Multiple dynamic pages generated from structured data

Astro is the natural next step — it's purpose-built for content sites, ships zero JS by default, and has first-class CMS integration. The Vite config and vanilla JS components migrate cleanly.

---

*Last reviewed: April 2026*
