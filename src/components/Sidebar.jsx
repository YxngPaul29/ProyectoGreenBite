import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Sidebar({ admin = false }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const pacienteMenu = (
    <>
      <div className="menu-label">Mi Espacio</div>
      <Link to="/paciente" className={`menu-item ${isActive('/paciente')}`}>Inicio</Link>
      <Link to="/paciente/perfil" className={`menu-item ${isActive('/paciente/perfil')}`}>Mi Perfil de Salud</Link>
      <Link to="/paciente/dietas" className={`menu-item ${isActive('/paciente/dietas')}`}>Mis Dietas</Link>
      <Link to="/paciente/pagos" className={`menu-item ${isActive('/paciente/pagos')}`}>Historial de Pagos</Link>

      <div className="menu-label">Explorar</div>
      <Link to="/paciente/catalogo" className={`menu-item ${isActive('/paciente/catalogo')}`}>Catálogo de Planes</Link>
    </>
  );

  const adminMenu = (
    <>
      <div className="menu-label">Principal</div>
      <Link to="/admin" className={`menu-item ${isActive('/admin')}`}>Dashboard</Link>
      
      <div className="menu-label">Gestión Clínica</div>
      <Link to="/admin/pacientes" className={`menu-item ${isActive('/admin/pacientes')}`}>Directorio de Pacientes</Link>
      <Link to="/admin/plantillas" className={`menu-item ${isActive('/admin/plantillas')}`}>Plantillas de Dietas</Link>
      <Link to="/admin/asignar" className={`menu-item ${isActive('/admin/asignar')}`}>Asignador de Dietas</Link>
      
      <div className="menu-label">Facturación</div>
      <Link to="/admin/cotizaciones" className={`menu-item ${isActive('/admin/cotizaciones')}`}>Cotizaciones & Pagos</Link>
    </>
  );

  return (
    <aside className="sidebar">
      <Link to={admin ? "/admin" : "/paciente"} className="sidebar-header">
        🍏 GreenBite
      </Link>
      <div className="sidebar-menu">
        {admin ? adminMenu : pacienteMenu}
      </div>
      <div className="sidebar-footer">
        <a href="#" className="menu-item" style={{ color: 'var(--red)' }} onClick={handleLogout}>
          Cerrar Sesión
        </a>
      </div>
    </aside>
  );
}
