/**
 * Iconografía única del sistema: trazo de 1.7, rejilla de 24, sin relleno.
 * Añadir un icono = añadir una entrada aquí; nunca emojis en la interfaz.
 */
const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="8.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="5" rx="1.6" />
      <rect x="13.5" y="10.5" width="7.5" height="10.5" rx="1.6" />
      <rect x="3" y="14" width="7.5" height="7" rx="1.6" />
    </>
  ),
  map: (
    <>
      <path d="M9 3 3 5.6v15.4L9 18.4l6 2.6 6-2.6V3l-6 2.6L9 3Z" />
      <path d="M9 3v15.4M15 5.6V21" />
    </>
  ),
  incident: (
    <>
      <path d="M12 3.5 3.2 19.2a1 1 0 0 0 .87 1.5h15.86a1 1 0 0 0 .87-1.5L12 3.5Z" />
      <path d="M12 10v4.2M12 17.4h.01" />
    </>
  ),
  camera: (
    <>
      <path d="M3.8 7.4h3.3l1.5-2.1h6.8l1.5 2.1h3.3a1 1 0 0 1 1 1v9.6a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1V8.4a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.2" r="3.4" />
    </>
  ),
  vehicle: (
    <>
      <rect x="3.6" y="3.4" width="16.8" height="13.2" rx="2.4" />
      <path d="M3.6 11.4h16.8M7.4 20.6v-4M16.6 20.6v-4" />
    </>
  ),
  stats: (
    <>
      <path d="M3 20.8h18" />
      <path d="M6.4 20.8v-8.4M11.4 20.8V4.6M16.4 20.8v-5.6M21 20.8v-3" />
    </>
  ),
  report: (
    <>
      <path d="M14 3.2H7a2 2 0 0 0-2 2v13.6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.2l-5-5Z" />
      <path d="M14 3.2v5h5M8.6 13h6.8M8.6 16.6h4.4" />
    </>
  ),
  data: (
    <>
      <ellipse cx="12" cy="5.8" rx="7.8" ry="2.9" />
      <path d="M4.2 5.8v6.2c0 1.6 3.5 2.9 7.8 2.9s7.8-1.3 7.8-2.9V5.8" />
      <path d="M4.2 12v6.2c0 1.6 3.5 2.9 7.8 2.9s7.8-1.3 7.8-2.9V12" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.4v2.6M12 19v2.6M2.4 12H5M19 12h2.6M5.2 5.2 7 7M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7.2" />
      <path d="m20.2 20.2-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.4a6 6 0 1 0-12 0c0 6.4-2.6 7.6-2.6 7.6h17.2S18 14.8 18 8.4Z" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.9" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
    </>
  ),
  moon: <path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z" />,
  night: (
    <>
      <path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z" />
      <path d="m17.4 3 .7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7.7-1.7Z" />
    </>
  ),
  download: <path d="M12 3.6v11M7.6 10.2 12 14.6l4.4-4.4M4.5 19.4h15" />,
  filter: <path d="M3.4 5.4h17.2l-6.6 7.8v6l-4 2v-8L3.4 5.4Z" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  minus: <path d="M5 12.5h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.4v5.6M12 16.6h.01" />
    </>
  ),
  warn: (
    <>
      <path d="M12 4 3.4 19.4h17.2L12 4Z" />
      <path d="M12 10v4M12 16.8h.01" />
    </>
  ),
  ok: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.4 2.8 2.8L16 9.8" />
    </>
  ),
  pothole: (
    <>
      <ellipse cx="12" cy="13" rx="7.4" ry="5.2" />
      <path d="M8.2 12.2c1.4-1.6 5.2-2.2 7.6-.4" />
    </>
  ),
  crack: (
    <>
      <path d="M6 3.5 10 9l-3 3.2 4.6 3.4-2 4.9" />
      <path d="m14.4 6.6 3.4 2.6-2 2.4 3.4 2.6" />
    </>
  ),
  road: <path d="M4 21 10 3M20 21 14 3M9 15h6" />,
  km: (
    <>
      <path d="M4 18.5c0-5 3.6-9 8-9s8-4 8-4" />
      <circle cx="4" cy="18.5" r="2" />
      <circle cx="20" cy="5.5" r="2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.4" y="5" width="17.2" height="15.6" rx="2.4" />
      <path d="M3.4 9.6h17.2M8 3.4v3.4M16 3.4v3.4" />
    </>
  ),
  columns: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16M15 4v16" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.6 20.4c1.2-3.6 4-5.4 7.4-5.4s6.2 1.8 7.4 5.4" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8.4" r="3.4" />
      <path d="M2.8 19.6c1-3 3.2-4.6 6.2-4.6s5.2 1.6 6.2 4.6" />
      <path d="M16.4 5.4a3.4 3.4 0 0 1 0 6.4M18 15.4c1.6.7 2.7 2.1 3.2 4.2" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h11M19 7h1M4 17h5M13 17h7" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="11" cy="17" r="2.2" />
    </>
  ),
  shield: <path d="M12 3 4.6 6v6c0 4.4 3 7.8 7.4 9 4.4-1.2 7.4-4.6 7.4-9V6L12 3Z" />,
  mail: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2.4" />
      <path d="m3.4 6.6 8.6 6.2 8.6-6.2" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10.4" width="16" height="10.2" rx="2.4" />
      <path d="M7.8 10.4V7.6a4.2 4.2 0 0 1 8.4 0v2.8" />
    </>
  ),
  eye: (
    <>
      <path d="M2.4 12S5.8 5.6 12 5.6 21.6 12 21.6 12 18.2 18.4 12 18.4 2.4 12 2.4 12Z" />
      <circle cx="12" cy="12" r="3.1" />
    </>
  ),
  panelLeft: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.4" />
      <path d="M9.5 4v16" />
    </>
  ),
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" />,
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 4v5h-5" />
    </>
  ),
}

export default function Icon({ name, size = 18, strokeWidth = 1.7, ...rest }) {
  const d = paths[name]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: `0 0 ${size}px` }}
      {...rest}
    >
      {d}
    </svg>
  )
}
