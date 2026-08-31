import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../components/Toast';
import { addPesoHistorial } from '../../lib/storage';
import ChangePasswordModal from '../../components/ChangePasswordModal';

export default function Perfil() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    edad: '',
    peso: '',
    altura: '',
    objetivo: 'sana',
    nivelActividad: 'sedentario'
  });
  const [imcData, setImcData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        edad: user.edad || '',
        peso: user.peso || '',
        altura: user.altura || '',
        objetivo: user.objetivo || 'sana',
        nivelActividad: user.nivelActividad || 'sedentario'
      });
      calculateIMC(user.peso, user.altura);
    }
  }, [user]);

  const calculateIMC = (peso, altura) => {
    const p = parseFloat(peso);
    const a = parseFloat(altura) / 100; // cm to m
    if (p > 0 && a > 0) {
      const imc = p / (a * a);
      let cat = 'Normal';
      let color = 'var(--green)';
      
      if (imc < 18.5) { cat = 'Bajo peso'; color = 'var(--blue)'; }
      else if (imc >= 25 && imc < 30) { cat = 'Sobrepeso'; color = 'var(--orange)'; }
      else if (imc >= 30) { cat = 'Obesidad'; color = 'var(--red)'; }

      setImcData({ value: imc.toFixed(1), cat, color });
    } else {
      setImcData(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'peso' || name === 'altura') {
      const p = name === 'peso' ? value : formData.peso;
      const a = name === 'altura' ? value : formData.altura;
      calculateIMC(p, a);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await updateProfile({
      nombre: formData.nombre,
      email: formData.email,
      edad: formData.edad,
      peso: formData.peso,
      altura: formData.altura,
      objetivo: formData.objetivo,
      nivelActividad: formData.nivelActividad
    });

    if (res.success) {
      // If weight changed, add to history
      if (parseFloat(formData.peso) !== parseFloat(user.peso)) {
        await addPesoHistorial(user.id, formData.peso);
      }
      addToast('Perfil actualizado correctamente', 'success');
    } else {
      addToast(res.error, 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Mi Perfil de Salud" />
        
        <div className="content-area">
          <div className="grid-2">
            <div className="card">
              <h2 className="section-title" style={{ fontSize: '20px' }}>Datos Personales</h2>
              <form onSubmit={handleSubmit}>
                <Input label="Nombre Completo" name="nombre" value={formData.nombre} onChange={handleChange} required />
                <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} required />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <Input label="Edad" name="edad" type="number" min="0" value={formData.edad} onChange={handleChange} required />
                  <Input label="Peso (kg)" name="peso" type="number" min="0" step="0.1" value={formData.peso} onChange={handleChange} required />
                  <Input label="Altura (cm)" name="altura" type="number" min="0" value={formData.altura} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Objetivo Principal</label>
                  <select name="objetivo" className="form-control" value={formData.objetivo} onChange={handleChange}>
                    <option value="sana">Alimentación Saludable</option>
                    <option value="bajar">Pérdida de Peso</option>
                    <option value="musculo">Aumento de Masa Muscular</option>
                    <option value="keto">Dieta Keto</option>
                    <option value="eco">Dieta Basada en Plantas (Vegana/Vegetariana)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nivel de Actividad Física</label>
                  <select name="nivelActividad" className="form-control" value={formData.nivelActividad} onChange={handleChange}>
                    <option value="sedentario">Sedentario (Poco o ningún ejercicio)</option>
                    <option value="ligero">Ligero (Ejercicio 1-3 días/semana)</option>
                    <option value="moderado">Moderado (Ejercicio 3-5 días/semana)</option>
                    <option value="activo">Activo (Ejercicio 6-7 días/semana)</option>
                    <option value="muy_activo">Muy Activo (Ejercicio intenso diario)</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" style={{ marginTop: '16px' }} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* IMC Card */}
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--text-mid)', marginBottom: '16px' }}>Tu Índice de Masa Corporal (IMC)</h3>
                
                {imcData ? (
                  <>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: imcData.color, lineHeight: 1 }}>
                      {imcData.value}
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>
                      Categoría: <span style={{ color: imcData.color }}>{imcData.cat}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
                    Ingresa tu peso y altura para calcular tu IMC.
                  </div>
                )}
                
                <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-light)', background: 'var(--body-bg)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Nota:</strong> El IMC es un indicador general y no distingue entre masa muscular y grasa. No constituye un diagnóstico médico.
                </div>
              </div>

              {/* Security Card */}
              <div className="card">
                <h3 style={{ fontSize: '16px', color: 'var(--text-dark)', marginBottom: '16px' }}>Seguridad de la Cuenta</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '16px' }}>
                  Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
                </p>
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                  Cambiar Contraseña
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
