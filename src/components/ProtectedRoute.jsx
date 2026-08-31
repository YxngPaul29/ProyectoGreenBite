import { useAuth } from '../lib/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import ChangePasswordModal from './ChangePasswordModal';

export default function ProtectedRoute({ children, roleRequired }) {
  const { isAuthenticated, user, mustChangePassword } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleRequired && user?.rol !== roleRequired) {
    return <Navigate to={user?.rol === 'admin' ? '/admin' : '/paciente'} replace />;
  }

  // If patient must change temp password, block access until done
  if (mustChangePassword && user?.rol === 'paciente') {
    return (
      <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
          <ChangePasswordModal required={true} />
        </div>
      </div>
    );
  }

  return children;
}
