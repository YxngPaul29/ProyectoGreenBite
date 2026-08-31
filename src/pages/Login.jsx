import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Login() {
  const { login, register, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo: 'paciente' // paciente o nutricionista
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (user?.rol === 'admin' ? '/admin' : '/paciente');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const res = await login(formData.email, formData.password, formData.tipo);
      if (res.success) {
        addToast(`Bienvenido de nuevo, ${res.user.nombre.split(' ')[0]}`, 'success');
        navigate(res.user.rol === 'admin' ? '/admin' : '/paciente');
      } else {
        addToast(res.error, 'error');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        addToast('Las contraseñas no coinciden.', 'error');
        setLoading(false);
        return;
      }

      const res = await register(formData.nombre, formData.email, formData.password);
      if (res.success) {
        addToast('Cuenta creada exitosamente. Por favor, inicia sesión.', 'success');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        addToast(res.error, 'error');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--green-light) 0%, var(--blue-soft) 100%)',
      padding: '20px'
    }}>
      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--green-dark)', fontSize: '28px', fontWeight: '800' }}>GreenBite</h1>
          <p style={{ color: 'var(--text-mid)', marginTop: '8px' }}>
            {isLogin ? 'Ingresa a tu cuenta' : 'Únete a GreenBite hoy mismo'}
          </p>
        </div>

        {/* Tabs for Login vs Register */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--body-bg)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button 
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer',
              background: isLogin ? 'white' : 'transparent',
              color: isLogin ? 'var(--text-dark)' : 'var(--text-mid)',
              fontWeight: isLogin ? '700' : '500',
              boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => { setIsLogin(true); setFormData(p => ({...p, tipo: 'paciente'})); }}
          >
            Iniciar Sesión
          </button>
          <button 
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer',
              background: !isLogin ? 'white' : 'transparent',
              color: !isLogin ? 'var(--text-dark)' : 'var(--text-mid)',
              fontWeight: !isLogin ? '700' : '500',
              boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <Input 
              label="Nombre Completo" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              required 
              placeholder="Ej. María González"
            />
          )}

          <Input 
            label="Correo Electrónico" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            placeholder="correo@ejemplo.com"
          />

          <Input 
            label="Contraseña" 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            placeholder="••••••••"
          />

          {!isLogin && (
            <Input 
              label="Confirmar Contraseña" 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              placeholder="••••••••"
            />
          )}

          {isLogin && (
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '-10px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Tipo de cuenta</label>
              <select 
                name="tipo" 
                className="form-control" 
                value={formData.tipo} 
                onChange={handleChange}
              >
                <option value="paciente">Paciente</option>
                <option value="nutricionista">Nutricionista (Admin)</option>
              </select>
            </div>
          )}

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Crear Cuenta')}
          </Button>
        </form>
        
        {isLogin && formData.tipo === 'nutricionista' && (
          <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-mid)', textAlign: 'center', background: 'var(--orange-soft)', padding: '10px', borderRadius: '4px' }}>
            <strong>Modo Demo:</strong> Usa admin@greenbite.com / admin123 para ingresar como administrador.
          </div>
        )}
      </div>
    </div>
  );
}
