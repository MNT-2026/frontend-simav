import { useState } from 'react'
import Icon from '../components/Icon'
import { Button, Card, Switch } from '../components/ui'
import { useToasts } from '../components/Toasts'
import { THEMES, useTheme } from '../theme/ThemeProvider'

const SECTIONS = [
  { id: 'perfil', label: 'Perfil', icon: 'user' },
  { id: 'cuenta', label: 'Cuenta y seguridad', icon: 'shield' },
  { id: 'usuarios', label: 'Usuarios', icon: 'team' },
  { id: 'notificaciones', label: 'Notificaciones', icon: 'bell' },
  { id: 'camaras', label: 'Cámaras', icon: 'camera' },
  { id: 'vehiculos', label: 'Vehículos', icon: 'vehicle' },
  { id: 'parametros', label: 'Parámetros de detección', icon: 'sliders' },
  { id: 'apariencia', label: 'Apariencia', icon: 'sun' },
]

/** Miniaturas de tema: colores fijos, para que se vean los tres a la vez. */
const PREVIEW = {
  light: { bg: '#f1f4f9', surf: '#ffffff', line: '#e2e7f0', ink: '#0d1420', acc: '#2563eb', map: '#e6ebf3', road: '#ffffff', dim: '#dfe4ee' },
  dark: { bg: '#0b0f16', surf: '#121824', line: '#212b3b', ink: '#e7ecf4', acc: '#4c8dff', map: '#0e1420', road: '#2c3a4e', dim: '#1c2534' },
  night: { bg: '#03060d', surf: '#070c15', line: '#141e2d', ink: '#dae5f2', acc: '#4c8dff', map: '#03060d', road: '#18293d', dim: '#101827' },
}

export default function Settings() {
  const { theme, setTheme, reducedMotion, setReducedMotion } = useTheme()
  const { push } = useToasts()
  const [section, setSection] = useState('apariencia')
  const [followSystem, setFollowSystem] = useState(false)
  const [density, setDensity] = useState('comoda')
  const [contrast, setContrast] = useState(true)

  return (
    <main className="content" style={{ flexDirection: 'row', gap: 18 }}>
      <nav className="settings-nav" aria-label="Secciones de configuración">
        <div className="sect" style={{ padding: '2px 11px 8px' }}>
          Ajustes
        </div>
        {SECTIONS.map((s) => (
          <button key={s.id} className={section === s.id ? 'on' : ''} onClick={() => setSection(s.id)}>
            <Icon name={s.icon} size={16} />
            {s.label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {section === 'apariencia' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <div>
                <div className="h-lg">Apariencia</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                  Ajusta cómo se ve SIMAV en esta cuenta. Se aplica en todos tus dispositivos.
                </div>
              </div>
              <span className="spacer" />
              <Button>Descartar</Button>
              <Button variant="primary" onClick={() => push({ tone: 'success', title: 'Preferencias guardadas' })}>
                Guardar cambios
              </Button>
            </div>

            <Card style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Tema de la interfaz</div>
                <div className="sub-text" style={{ marginTop: 3, lineHeight: 1.5 }}>
                  Elige el modo con el que trabajarás durante la jornada. El mapa se adapta
                  automáticamente al tema y los marcadores de severidad conservan su color.
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-card ${theme === t.id ? 'on' : ''}`}
                      onClick={() => {
                        setTheme(t.id)
                        push({ tone: 'success', title: `Tema ${t.label} activado`, desc: t.hint })
                      }}
                      aria-pressed={theme === t.id}
                    >
                      <ThemePreview p={PREVIEW[t.id]} />
                      <div className="tfoot">
                        <span className={`radio ${theme === t.id ? 'on' : ''}`} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12.5 }}>{t.label}</div>
                          <div className="sub-text" style={{ fontSize: 11 }}>
                            {t.hint}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow
                label="Seguir el tema del sistema operativo"
                desc="Cambia automáticamente entre Light y Dark según la configuración de tu equipo."
              >
                <Switch checked={followSystem} onChange={setFollowSystem} label="Seguir el sistema" />
              </SettingRow>

              <SettingRow
                label="Densidad de las tablas"
                desc="Compacta muestra más filas por pantalla; cómoda facilita la lectura en jornadas largas."
              >
                <div className="chips">
                  <button className={density === 'compacta' ? 'on' : ''} onClick={() => setDensity('compacta')}>
                    Compacta
                  </button>
                  <button className={density === 'comoda' ? 'on' : ''} onClick={() => setDensity('comoda')}>
                    Cómoda
                  </button>
                </div>
              </SettingRow>

              <SettingRow label="Estilo del mapa" desc="Los marcadores de incidentes mantienen siempre el mismo color en los tres temas.">
                <select className="field" style={{ width: 240 }} aria-label="Estilo del mapa">
                  <option>Vectorial · calles resaltadas</option>
                  <option>Vectorial · mínimo</option>
                  <option>Satélite</option>
                </select>
              </SettingRow>

              <SettingRow label="Reducir animaciones" desc="Desactiva transiciones y movimientos no esenciales de la interfaz.">
                <Switch checked={reducedMotion} onChange={setReducedMotion} label="Reducir animaciones" />
              </SettingRow>

              <SettingRow
                label="Contraste reforzado"
                desc="Aumenta el contraste de bordes y texto secundario. Recomendado para pantallas con brillo alto."
              >
                <Switch checked={contrast} onChange={setContrast} label="Contraste reforzado" />
              </SettingRow>
            </Card>
          </>
        ) : (
          <>
            <div className="h-lg">{SECTIONS.find((s) => s.id === section)?.label}</div>
            <Card style={{ flex: 1, display: 'flex' }}>
              <div className="empty">
                <div className="state-icon" style={{ background: 'var(--acc-soft)', color: 'var(--acc)' }}>
                  <Icon name={SECTIONS.find((s) => s.id === section)?.icon} size={22} />
                </div>
                <h3>Sección pendiente de conectar</h3>
                <p>
                  El prototipo define la navegación y el patrón de formulario. Esta sección se conecta
                  con la API cuando esté disponible.
                </p>
                <div style={{ marginTop: 16 }}>
                  <Button onClick={() => setSection('apariencia')}>Volver a Apariencia</Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="setting-row">
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
        <div className="sub-text" style={{ marginTop: 3, lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
      {children}
    </div>
  )
}

function ThemePreview({ p }) {
  return (
    <svg viewBox="0 0 300 150" style={{ width: '100%', display: 'block' }} aria-hidden="true">
      <rect width="300" height="150" fill={p.bg} />
      <rect width="300" height="22" fill={p.surf} />
      <path d="M0 22h300" stroke={p.line} />
      <rect x="8" y="7" width="8" height="8" rx="2.5" fill={p.acc} />
      <rect x="20" y="9" width="42" height="5" rx="2.5" fill={p.ink} />
      <rect y="22" width="62" height="128" fill={p.surf} />
      <path d="M62 22v128" stroke={p.line} />
      <rect x="7" y="32" width="48" height="12" rx="4" fill={p.acc} />
      <rect x="7" y="48" width="40" height="5" rx="2.5" fill={p.dim} />
      <rect x="7" y="60" width="44" height="5" rx="2.5" fill={p.dim} />
      <rect x="7" y="72" width="36" height="5" rx="2.5" fill={p.dim} />
      <rect x="72" y="32" width="50" height="30" rx="6" fill={p.surf} stroke={p.line} />
      <rect x="128" y="32" width="50" height="30" rx="6" fill={p.surf} stroke={p.line} />
      <rect x="184" y="32" width="50" height="30" rx="6" fill={p.surf} stroke={p.line} />
      <rect x="240" y="32" width="52" height="106" rx="6" fill={p.surf} stroke={p.line} />
      <rect x="72" y="70" width="162" height="68" rx="6" fill={p.map} stroke={p.line} />
      <g stroke={p.road} strokeWidth="3">
        <path d="M72 104h162M150 70v68" />
      </g>
      <circle cx="150" cy="104" r="4" fill="#dc3d34" />
      <circle cx="110" cy="86" r="3" fill="#d9862a" />
      <circle cx="196" cy="120" r="3" fill="#0e9f8a" />
    </svg>
  )
}
