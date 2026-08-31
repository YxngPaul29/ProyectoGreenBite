import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser, setCurrentUser, clearCurrentUser,
  getPacienteByEmail, createPaciente, getPacienteById,
  updatePaciente, normalizeEmail, changePassword as storageChangePassword,
} from './storage.js';

const AuthContext = createContext(null);

const ADMIN_EMAIL = 'admin@greenbite.com';
const ADMIN_PASS = 'admin123';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Load session on mount
  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) {
      setUser(saved);
      if (saved.mustChangePassword) {
        setMustChangePassword(true);
      }
    }
    setLoading(false);
  }, []);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!user) return;

    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  const login = useCallback(async (email, password, tipo = 'paciente') => {
    const normalizedEmail = normalizeEmail(email);

    // Admin login
    if (tipo === 'nutricionista' || tipo === 'admin') {
      if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASS) {
        const adminProfile = {
          id: 'admin',
          nombre: 'Dra. Ana Torres',
          email: ADMIN_EMAIL,
          rol: 'admin',
        };
        setUser(adminProfile);
        setCurrentUser(adminProfile);
        return { success: true, user: adminProfile };
      }
      return { success: false, error: 'Credenciales de administrador incorrectas.' };
    }

    // Patient login
    const paciente = await getPacienteByEmail(normalizedEmail);
    if (!paciente) {
      return { success: false, error: 'No existe una cuenta con ese correo electrónico.' };
    }
    if (paciente.password !== password) {
      return { success: false, error: 'La contraseña es incorrecta.' };
    }

    // Don't store password in session
    const sessionUser = { ...paciente };
    delete sessionUser.password;

    setUser(sessionUser);
    setCurrentUser(sessionUser);

    if (paciente.mustChangePassword) {
      setMustChangePassword(true);
    }

    return { success: true, user: sessionUser };
  }, []);

  const register = useCallback(async (nombre, email, password) => {
    const normalizedEmail = normalizeEmail(email);

    if (!nombre || nombre.trim().length < 2) {
      return { success: false, error: 'El nombre debe tener al menos 2 caracteres.' };
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: 'El formato del correo electrónico no es válido.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    try {
      const paciente = await createPaciente({
        nombre: nombre.trim(),
        email: normalizedEmail,
        password,
        edad: 0,
        sexo: 'M',
        peso: 0,
        altura: 0,
        objetivo: 'sana',
      });
      return { success: true, paciente };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setMustChangePassword(false);
    clearCurrentUser();
  }, []);

  const changePassword = useCallback(async (currentPass, newPass) => {
    if (!user) return { success: false, error: 'No hay sesión activa.' };
    try {
      const updated = await storageChangePassword(user.id, currentPass, newPass);
      const sessionUser = { ...updated };
      delete sessionUser.password;
      setUser(sessionUser);
      setCurrentUser(sessionUser);
      setMustChangePassword(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!user || user.rol === 'admin') return;
    const fresh = await getPacienteById(user.id);
    if (fresh) {
      const sessionUser = { ...fresh };
      delete sessionUser.password;
      setUser(sessionUser);
      setCurrentUser(sessionUser);
    }
  }, [user]);

  const updateProfile = useCallback(async (data) => {
    if (!user || user.rol === 'admin') return { success: false, error: 'No permitido.' };
    try {
      const updated = await updatePaciente(user.id, data);
      const sessionUser = { ...updated };
      delete sessionUser.password;
      setUser(sessionUser);
      setCurrentUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    isPaciente: user?.rol === 'paciente',
    mustChangePassword,
    login,
    register,
    logout,
    changePassword,
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
