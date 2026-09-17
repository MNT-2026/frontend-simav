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

- `components/BrandLogo.jsx` is the SIMAV logo (PNGs in `src/assets/brand/`). The original is white + blue
  for Dark/Night; Light uses a variant with the white recolored to navy (#0B2A5B). It picks the
  variant from `useTheme()`; pass `surface="light"` on surfaces that ignore the theme (report sheet).
- `components/Icon.jsx` is the single icon set (inline SVG, `<Icon name="…" size strokeWidth/>`).
  **No emojis in the UI** — add a new path to `Icon.jsx` instead.
- `components/ui.jsx` — Button, Card/CardHead, SeverityBadge, StatusBadge, Confidence, Checkbox,
  Switch, Skeleton, EmptyState, ErrorState, Modal, Pager, Delta. Reuse these rather than restyling.
- `components/charts.jsx` — hand-rolled SVG charts (Sparkline, SparkBars, TrendChart, GroupedBars,
  RankBars, SeverityBar, Legend). No charting library; keep it that way.
- `components/RoadMap.jsx` — real interactive map of Ibagué with **Leaflet + react-leaflet** over
  free OpenStreetMap tiles (no API key). **The map is always light**, whatever the app theme:
  the canvas carries `data-theme="light"` so markers, tooltips and controls use light tokens. Markers are
  `CircleMarker`s colored through CSS classes (`.sev-alta`, `.sev-media`, `.sev-baja`) so colors
  still come from tokens; Leaflet only applies `className` on creation, so selection re-keys the
  marker. Overlays passed as children need `z-index: 1000` (see `.mapwrap .map-overlay`).
  `MiniMap` shows a single point; `VehicleMap` shows the fleet (all buses + the selected bus route,
  from `data/vehicleRoutes.js`, generated from OSM street geometry). `EvidenceFrame` shows the real photo (`src`,
  the `evidence_url` uploaded by the mobile app) or falls back to a simulated SVG frame.
- Toasts: `const { push } = useToasts()` for notices, `useFakeExport()` for export flows.

## Mock-data coherence

The numbers are fictional but deliberately consistent across screens (147 detections = 82 potholes
+ 65 cracks, 23 critical, 8/10 cameras online). If you change a figure in `mock.js`, update the
places that restate it — KPIs, charts, and page copy — or the demo stops adding up.

## Datos: la API real y lo que sigue en mock

`src/api/` es la única puerta a la red. Nadie llama a `fetch` fuera de `api/client.js`, salvo
`api/geocoding.js` (Nominatim, servicio externo: fila de 1 petición/s y caché en localStorage).

- `client.js` — wrapper de fetch, `ApiError` con `status`, `isNotFound`, `isUnavailable`.
  La URL base sale de `VITE_API_URL` (ver `.env.example`); por defecto
  `http://localhost:8000/api/v1`.
  Manda las cookies (`credentials: 'include'`), reenvía la cookie `simav_csrf` en la cabecera
  `X-CSRF-Token` en los métodos no seguros y, ante un 401, intenta una vez `POST /auth/refresh`
  y reintenta; si sigue en 401 avisa al `AuthProvider`. Front y API tienen que usar el mismo
  host (`localhost` con `localhost`): con `127.0.0.1` el front no lee la cookie CSRF.
  En producción (`vite build`) la base por defecto es `/api/v1`: Vercel reenvía `/api/*` al
  backend en Render (`vercel.json`), así panel y API comparten dominio y la cookie CSRF es legible.
- `auth.js` + `src/auth/AuthProvider.jsx` — login/logout/`/auth/me` reales. `useAuth()` da
  `{ user, status, login, logout }` y `<RequireAuth/>` protege todas las rutas del shell.
- `mappers.js` — traduce enums del backend (inglés) a la interfaz (español) y de vuelta:
  `POTHOLE`→`Bache`, `HIGH`→`alta`, `ACTIVE`→`nuevo`, `confidence` 0–1 → 0–100.
  **Las pantallas nunca ven enums y la API nunca ve español.**
- `geo.js` — ciudad de la operación (`CITY`, Ibagué), su área de cobertura `CITY_BOUNDS` y
  la traducción de un área de Leaflet a los filtros `min_/max_latitude/longitude` de la API.
  El Mapa pide de nuevo al servidor cada vez que cambia el área visible.
- Datos de demostración: `scripts/seed_demo_ibague.py` en el backend los crea vía API, con
  ubicaciones sobre ejes de calles reales descargados de OpenStreetMap (Overpass).
- `incidents.js` / `inspections.js` — un módulo por recurso, devuelven objetos ya mapeados.
- `statistics.js` — `GET /road-incidents/stats`. Calcula la ventana de los últimos N periodos
  (30 días, 12 semanas o 12 meses) en hora de Ibagué y traduce enums a español.
- `geocoding.js` — `usePlaceNames(points)`: nombre de calle y barrio de las zonas calientes.
- `useApi.js` — `{ data, loading, error, reload }`, cancela la petición anterior al
  cambiar las dependencias.

**Conectadas a la API**: Dashboard (KPIs, mini gráficas semanales de total, baches, grietas y
críticos, mapa y recientes), Mapa, Incidentes (filtros y paginación **en servidor**), Detalle
de incidente (con cambio de estado real), el contador del sidebar, y Estadísticas (serie,
severidad, tipos, zonas calientes y mapa).

**Todavía en `mock.js`**: Cámaras, Vehículos, Reportes, Datos, las notificaciones y, en el
Dashboard, los kilómetros analizados y las cámaras activas. El backend no
modela nada de eso. Donde un dato falso convive con datos reales, la interfaz lo dice
(«dato de demostración»).

**Huecos del backend que se notan en la interfaz** (candidatos a la próxima iteración):
- No hay ordenación por columna ni búsqueda por texto, así que las cabeceras de la tabla
  ya no ordenan y el buscador solo filtra la página cargada.
- No existen dirección, ruta, cámara ni vehículo por incidente: esas columnas muestran «—».
- No hay estado «en seguimiento» ni histórico de revisión: el seguimiento del detalle se
  deriva del estado actual.
