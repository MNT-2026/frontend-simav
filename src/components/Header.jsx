import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import ConnectionStatus from './ConnectionStatus'
import Icon from './Icon'
import { THEMES, useTheme } from '../theme/ThemeProvider'
import { notifications } from '../data/mock'
import { useAuth } from '../auth/AuthProvider'

export default function Header({ title, crumbs = [], collapsed, onToggleSidebar }) {
  const { theme, cycle } = useTheme()
  const { user, logout } = useAuth()
  const [openNotifs, setOpenNotifs] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenNotifs(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const unread = notifications.filter((n) => n.unread).length

  return (
    <header className="header">
      <div className={`brand ${collapsed ? 'collapsed' : ''}`}>
        <Link to="/dashboard" className="brand-link" aria-label="SIMAV · Inicio">
          {collapsed ? <BrandLogo variant="mark" height={32} /> : <BrandLogo height={34} />}
        </Link>
      </div>

      <div className="header-mid">
        <button
          className="iconbtn"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <Icon name="panelLeft" size={17} />
        </button>
        <div>
          <div className="crumb">
            <Link to="/dashboard">Inicio</Link>
            {crumbs.map((c) => (
              <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="chevronRight" size={12} strokeWidth={2.4} />
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span style={{ color: 'var(--mut)' }}>{c.label}</span>}
              </span>
            ))}
          </div>
          <div className="page-title">{title}</div>
        </div>

        <span className="spacer" />

        <div className="searchbox" role="search">
          <Icon name="search" size={15} strokeWidth={1.8} />
          Buscar incidente, cámara, ruta…
          <span className="kbd">⌘K</span>
        </div>
      </div>

      <div className="header-right" ref={ref}>
        <ConnectionStatus />
        <div style={{ position: 'relative' }}>
          <button
            className="iconbtn"
            onClick={() => setOpenNotifs((v) => !v)}
            aria-label={`Notificaciones (${unread} sin leer)`}
          >
            <Icon name="bell" size={17} />
            {unread > 0 && <span className="dot" />}
          </button>
          {openNotifs && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 42,
                width: 320,
                zIndex: 50,
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div className="card-head">
                <span className="card-title" style={{ fontSize: 12.5 }}>
                  Notificaciones
                </span>
                <span className="spacer" />
                <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 11.5 }}>
                  Marcar todas como leídas
                </a>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '11px 14px',
                    borderBottom: '1px solid var(--line-2)',
                    display: 'flex',
                    gap: 10,
                    background: n.unread ? 'var(--acc-soft)' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      flex: '0 0 8px',
                      borderRadius: '50%',
                      marginTop: 5,
                      background:
                        n.tone === 'high' ? 'var(--high)' : n.tone === 'med' ? 'var(--med)' : 'var(--line)',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{n.title}</div>
                    <div className="sub-text" style={{ fontSize: 11, marginTop: 2 }}>
                      {n.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="iconbtn" onClick={cycle} aria-label="Cambiar tema" title="Cambiar tema">
          <Icon name={THEMES.find((t) => t.id === theme)?.icon ?? 'sun'} size={17} />
        </button>

        <Link to="/configuracion" className="header-user" style={{ color: 'inherit' }}>
          <div className="avatar">{user.initials}</div>
          <div>
            <div className="uname">{user.name}</div>
            <div className="urole">{user.role}</div>
          </div>
        </Link>
        <button className="iconbtn" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <Icon name="logout" size={17} />
        </button>
      </div>
    </header>
  )
}
