import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Data layers
import { AuthProvider } from './lib/AuthContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import DashboardPaciente from './pages/paciente/Dashboard';
import PerfilPaciente from './pages/paciente/Perfil';
import MisDietasPaciente from './pages/paciente/MisDietas';
import CatalogoPaciente from './pages/paciente/CatalogoPaciente';
import PagosPaciente from './pages/paciente/Pagos';

import DashboardAdmin from './pages/admin/Dashboard';
import PacientesAdmin from './pages/admin/Pacientes';
import PlantillasAdmin from './pages/admin/Plantillas';
import AsignarAdmin from './pages/admin/Asignar';
import CotizacionesAdmin from './pages/admin/Cotizaciones';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/catalogo" element={<Catalogo />} />

          {/* Patient Routes */}
          <Route path="/paciente" element={<ProtectedRoute roleRequired="paciente"><DashboardPaciente /></ProtectedRoute>} />
          <Route path="/paciente/perfil" element={<ProtectedRoute roleRequired="paciente"><PerfilPaciente /></ProtectedRoute>} />
          <Route path="/paciente/dietas" element={<ProtectedRoute roleRequired="paciente"><MisDietasPaciente /></ProtectedRoute>} />
          <Route path="/paciente/catalogo" element={<ProtectedRoute roleRequired="paciente"><CatalogoPaciente /></ProtectedRoute>} />
          <Route path="/paciente/pagos" element={<ProtectedRoute roleRequired="paciente"><PagosPaciente /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/pacientes" element={<ProtectedRoute roleRequired="admin"><PacientesAdmin /></ProtectedRoute>} />
          <Route path="/admin/plantillas" element={<ProtectedRoute roleRequired="admin"><PlantillasAdmin /></ProtectedRoute>} />
          <Route path="/admin/asignar" element={<ProtectedRoute roleRequired="admin"><AsignarAdmin /></ProtectedRoute>} />
          <Route path="/admin/cotizaciones" element={<ProtectedRoute roleRequired="admin"><CotizacionesAdmin /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
