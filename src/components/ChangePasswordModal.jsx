import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import Button from './Button';

export default function ChangePasswordModal({ required = false, onClose }) {
  const { changePassword } = useAuth();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPass !== confirmPass) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPass.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPass, newPass);
    setLoading(false);

    if (!res.success) {
      setError(res.error);
    } else {
      if (onClose) onClose();
      else window.location.reload(); // Refresh if required flow
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', color: 'var(--green-dark)', marginBottom: '10px' }}>
        {required ? 'Actualización Requerida' : 'Cambiar Contraseña'}
      </h2>
      <p style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '20px' }}>
        {required 
          ? 'Por seguridad, debes cambiar tu contraseña temporal antes de continuar usando la plataforma.' 
          : 'Ingresa tu contraseña actual y la nueva contraseña.'}
      </p>

      {error && (
        <div style={{ background: 'var(--red-soft)', color: 'var(--red)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Contraseña Actual</label>
          <input 
            type="password" 
            className="form-control" 
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nueva Contraseña</label>
          <input 
            type="password" 
            className="form-control" 
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirmar Contraseña</label>
          <input 
            type="password" 
            className="form-control" 
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          {!required && (
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Contraseña'}
          </Button>
        </div>
      </form>
    </div>
  );
}
