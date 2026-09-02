import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { THEMES, useTheme } from '../theme/ThemeProvider'
import { user } from '../data/mock'

const GROUPS = [
  {
    title: 'Operación',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/mapa', label: 'Mapa', icon: 'map' },
      { to: '/incidentes', label: 'Incidentes', icon: 'incident', count: '23' },
      { to: '/camaras', label: 'Cámaras', icon: 'camera', count: '8/10' },
      { to: '/vehiculos', label: 'Vehículos', icon: 'vehicle' },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { to: '/estadisticas', label: 'Estadísticas', icon: 'stats' },
      { to: '/reportes', label: 'Reportes', icon: 'report' },
      { to: '/datos', label: 'Datos', icon: 'data' },
    ],
  },
  {
    title: 'Sistema',
    items: [{ to: '/configuracion', label: 'Configuración', icon: 'settings' }],
  },
]

export default function Sidebar({ collapsed }) {
  const { theme, setTheme } = useTheme()

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {GROUPS.map((group, gi) => (
        <div key={group.title} style={{ width: '100%', paddingTop: gi ? 16 : 0 }}>
          <div className="sect">{collapsed ? group.title.slice(0, 3) : group.title}</div>
          <nav className="nav">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? undefined : item.label}
              >
                <Icon name={item.icon} size={18} />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.count && <span className="count">{item.count}</span>}
                  </>
                )}
                {collapsed && (
                  <>
                    {item.count && <span className="count">{item.count}</span>}
                    <span className="tip">
                      {item.label}
                      {item.count ? ` · ${item.count}` : ''}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="sidebar-foot">
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div className="avatar" title={`${user.name} · ${user.role}`}>
              {user.initials}
            </div>
            <button
              className="iconbtn"
              onClick={() => {
                const i = THEMES.findIndex((t) => t.id === theme)
                setTheme(THEMES[(i + 1) % THEMES.length].id)
              }}
              title={`Tema: ${THEMES.find((t) => t.id === theme)?.label}`}
              aria-label="Cambiar tema"
            >
              <Icon name={THEMES.find((t) => t.id === theme)?.icon ?? 'sun'} size={17} />
            </button>
          </div>
        ) : (
          <>
            <div className="usercard">
              <div className="avatar">{user.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div className="uname">{user.name}</div>
                <div className="urole">Rol: {user.role}</div>
              </div>
            </div>
            <div>
              <div className="sect" style={{ paddingBottom: 6 }}>
                Tema
              </div>
              <div className="themesel" role="radiogroup" aria-label="Tema de la interfaz">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    role="radio"
                    aria-checked={theme === t.id}
                    className={theme === t.id ? 'on' : ''}
                    onClick={() => setTheme(t.id)}
                  >
                    <Icon name={t.icon} size={13} strokeWidth={1.9} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
