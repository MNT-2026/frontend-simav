import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import Cameras from './pages/Cameras'
import Vehicles from './pages/Vehicles'
import Statistics from './pages/Statistics'
import DataExplorer from './pages/DataExplorer'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/incidentes" element={<Incidents />} />
        <Route path="/incidentes/:id" element={<IncidentDetail />} />
        <Route path="/camaras" element={<Cameras />} />
        <Route path="/vehiculos" element={<Vehicles />} />
        <Route path="/estadisticas" element={<Statistics />} />
        <Route path="/datos" element={<DataExplorer />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/configuracion" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
