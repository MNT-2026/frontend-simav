import { useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { shortId } from '../api/mappers'

const META = {
  '/dashboard': { title: 'Dashboard operativo', crumbs: [{ label: 'Dashboard' }] },
  '/mapa': { title: 'Mapa de incidentes', crumbs: [{ label: 'Mapa' }] },
  '/incidentes': { title: 'Incidentes', crumbs: [{ label: 'Incidentes' }] },
  '/camaras': { title: 'Cámaras', crumbs: [{ label: 'Cámaras' }] },
  '/vehiculos': { title: 'Vehículos', crumbs: [{ label: 'Vehículos' }] },
  '/estadisticas': { title: 'Estadísticas', crumbs: [{ label: 'Estadísticas' }] },
  '/reportes': { title: 'Reportes', crumbs: [{ label: 'Reportes' }] },
  '/datos': { title: 'Datos', crumbs: [{ label: 'Datos' }] },
  '/configuracion': { title: 'Configuración', crumbs: [{ label: 'Configuración' }] },
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const { id } = useParams()

  let meta = META[pathname]
  if (!meta && pathname.startsWith('/incidentes/')) {
    // El id es un UUID: en la cabecera solo cabe (y se lee) su prefijo.
    const label = shortId(id ?? pathname.split('/').pop())
    meta = {
      title: `Incidente ${label}`,
      crumbs: [{ label: 'Incidentes', to: '/incidentes' }, { label }],
    }
  }

  return (
    <div className="shell">
      <Header
        title={meta?.title ?? 'ROADVISION'}
        crumbs={meta?.crumbs ?? []}
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed((v) => !v)}
      />
      <div className="body">
        <Sidebar collapsed={collapsed} />
        <Outlet />
      </div>
    </div>
  )
}
