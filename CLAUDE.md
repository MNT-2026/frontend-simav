# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo (`frontend-simav`) holds the whole app and is **nested inside an outer `Front-SIMAV`
git repository** that tracks nothing of its own. Commit code changes here, not in the parent.

## Commands

```bash
npm install
npm run dev      # Vite dev server on http://localhost:5173 (opens the browser)
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

There is no test runner, linter, or formatter configured — don't invent commands for them.

## What this is

ROADVISION: a frontend-only prototype of a road-infrastructure control center (pothole/crack
detection from cameras and vehicles). **All data is mock data** in `src/data/mock.js`; there is no
backend, no auth, and no network calls. Login (`src/pages/Login.jsx`) validates password length and
`setTimeout`s into `/dashboard`. Exports are simulated by `useFakeExport()` in
`src/components/Toasts.jsx`, which pushes a progress toast that resolves to a fake "Descargar".

Everything user-facing is in **Spanish** — UI copy, route paths (`/incidentes`, `/camaras`,
`/estadisticas`), mock field values (`alta`/`media`/`baja`), code comments, and error messages.
Keep new code in Spanish to match.

## Architecture

`main.jsx` wraps `<App/>` in `BrowserRouter → ThemeProvider → ToastProvider`. `App.jsx` holds the
whole route table: `/` is Login (outside the shell), everything else nests under `AppLayout`, and
`*` redirects to `/dashboard`.

`components/AppLayout.jsx` owns the sidebar-collapsed state and a `META` map from pathname → page
title + breadcrumbs (with a special case for `/incidentes/:id`). **Adding a page means touching
three places**: a `<Route>` in `App.jsx`, an entry in `META`, and a nav item in `Sidebar.jsx`.

Pages are self-contained: they import mock data, do their own filtering/sorting/pagination with
`useMemo` + local `useState` (see `pages/Incidents.jsx` for the canonical table pattern:
`PAGE_SIZE`, `SEV_ORDER`, sort `{key, dir}`, cross-page multi-select, `Modal` confirmation), and
compose primitives from `components/ui.jsx`. There is no store, no data layer, and no fetching
abstraction — when a real API arrives, `src/data/mock.js` is the seam to replace.

## Styling — read this before touching visuals

Styling is **global CSS with semantic class names**, not CSS modules, Tailwind, or CSS-in-JS.
Two files only:

- `src/styles/tokens.css` — the three themes (`light`, `dark`, `night`) as CSS variables under
  `[data-theme='…']` selectors.
- `src/styles/app.css` — base + every component style, in commented sections (`/* ---------- tablas
  ---------- */`, `sidebar`, `mapa`, `toasts`, …). Add new rules to the matching section.

Inline `style` props are used freely for one-off layout (gaps, flex, widths), but **never for
color** — colors always come from tokens (`var(--acc)`, `var(--high)`, `var(--map-bg)`).

Token discipline that the design depends on:
- `--acc` / `--acc-deep` / `--acc-bright` are the single brand voice (blue). Nothing else uses them.
- `--high` / `--med` / `--low` (red / amber / teal) are **reserved for severity** and never decorative.
- `--s1` / `--s2` are the two chart series, validated for color-blindness against both light and
  dark surfaces — don't add a third series color casually.
- The only place hard-coded colors are legitimate is the theme thumbnails in `pages/Settings.jsx`,
  which must show all three themes at once.

`ThemeProvider` (`src/theme/ThemeProvider.jsx`) writes `data-theme` and `data-motion` onto
`<html>` and persists both to `localStorage` (`roadvision:theme`, `roadvision:motion`). Respect
`data-motion="reduced"` when adding animation.

## Component conventions

- `components/Icon.jsx` is the single icon set (inline SVG, `<Icon name="…" size strokeWidth/>`).
  **No emojis in the UI** — add a new path to `Icon.jsx` instead.
- `components/ui.jsx` — Button, Card/CardHead, SeverityBadge, StatusBadge, Confidence, Checkbox,
  Switch, Skeleton, EmptyState, ErrorState, Modal, Pager, Delta. Reuse these rather than restyling.
- `components/charts.jsx` — hand-rolled SVG charts (Sparkline, SparkBars, TrendChart, GroupedBars,
  RankBars, SeverityBar, GeoDensity, Legend). No charting library; keep it that way.
- `components/RoadMap.jsx` — a hand-drawn SVG city map (`viewBox="0 0 1200 840"`) with markers,
  clusters and an optional route. No map library, no tiles; map colors are tokens so it themes.
- Toasts: `const { push } = useToasts()` for notices, `useFakeExport()` for export flows.

## Mock-data coherence

The numbers are fictional but deliberately consistent across screens (147 detections = 82 potholes
+ 65 cracks, 23 critical, 8/10 cameras online). If you change a figure in `mock.js`, update the
places that restate it — KPIs, charts, and page copy — or the demo stops adding up.
