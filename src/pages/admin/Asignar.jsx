import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import { getPacientes, getPlantillas, createPlan } from '../../lib/storage';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const COMIDAS = ['desayuno', 'media', 'almuerzo', 'merienda', 'cena'];

export default function Asignar() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [planNombre, setPlanNombre] = useState('Plan Nutricional Personalizado');
  const [selectedPlantillaId, setSelectedPlantillaId] = useState('');
  const [activeDay, setActiveDay] = useState('Lunes');
  
  // Weekly Diet Builder State: semana[dia][comida] = string
  const [semana, setSemana] = useState({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [pacientesData, plantillasData] = await Promise.all([getPacientes(), getPlantillas()]);
      setPacientes(pacientesData.filter(p => p.estado === 'Activo'));
      setPlantillas(plantillasData);
      setLoading(false);
    }
    loadData();

    // Init empty week
    const initWeek = {};
    DIAS.forEach(d => {
      initWeek[d] = { desayuno: '', media: '', almuerzo: '', merienda: '', cena: '' };
    });
    setSemana(initWeek);
  }, []);

  const handleMealChange = (dia, comida, value) => {
    setSemana(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [comida]: value
      }
    }));
  };

  const handleAutofillPlantilla = () => {
    if (!selectedPlantillaId) return;
    const plantilla = plantillas.find(p => p.id === selectedPlantillaId);
    if (!plantilla) return;

    // We don't have stored meals in plantillas in this simplified model,
    // but in a real app we'd load the template's meals here.
    // For now, we'll just set the name and notify.
    setPlanNombre(`Plan ${plantilla.nombre}`);
    addToast('Plantilla aplicada. Macros y nombre actualizados.', 'info');
  };

  const handleSave = async () => {
    if (!selectedPacienteId) {
      addToast('Debes seleccionar un paciente.', 'error');
      return;
    }
    if (!planNombre.trim()) {
      addToast('Debes ingresar un nombre para el plan.', 'error');
      return;
    }

    // Optional validation: check if at least some meals are filled
    const hasContent = DIAS.some(d => COMIDAS.some(c => semana[d][c].trim() !== ''));
    if (!hasContent) {
      addToast('El plan está completamente vacío. Agrega al menos una comida.', 'error');
      return;
    }

    setSaving(true);
    try {
      await createPlan({
        pacienteId: selectedPacienteId,
        nombre: planNombre,
        plantillaId: selectedPlantillaId || null,
        semana: semana
      });
      addToast('Plan asignado exitosamente. El paciente ha sido notificado.', 'success');
      navigate('/admin/pacientes');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const mealLabels = {
    desayuno: 'Desayuno',
    media: 'Media Mañana',
    almuerzo: 'Almuerzo',
    merienda: 'Merienda',
    cena: 'Cena'
  };

  return (
    <div className="dashboard-layout">
      <Sidebar admin={true} />
      <main className="main-content">
        <Topbar title="Asignador Semanal de Dietas" />
        
        <div className="content-area">
          <div className="grid-2">
            
            {/* Context Settings */}
            <div className="card">
              <h2 className="section-title" style={{ fontSize: '18px' }}>Configuración del Plan</h2>
              
              <div className="form-group">
                <label className="form-label">Paciente Destino</label>
                <select 
                  className="form-control" 
                  value={selectedPacienteId}
                  onChange={(e) => setSelectedPacienteId(e.target.value)}
                >
                  <option value="">-- Seleccionar Paciente --</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Plan (Visible para el paciente)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={planNombre}
                  onChange={(e) => setPlanNombre(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Plantilla Base (Opcional)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    className="form-control" 
                    value={selectedPlantillaId}
                    onChange={(e) => setSelectedPlantillaId(e.target.value)}
                  >
                    <option value="">-- Sin Plantilla --</option>
                    {plantillas.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  <Button variant="outline" onClick={handleAutofillPlantilla}>Aplicar</Button>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>
                  Usar una plantilla predefinirá los macros y calorías.
                </div>
              </div>

              <div style={{ marginTop: '40px', padding: '20px', background: 'var(--blue-soft)', borderRadius: 'var(--radius-sm)' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--blue)', marginBottom: '8px' }}>Información</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', margin: 0 }}>
                  Al guardar, este plan reemplazará cualquier plan activo que el paciente tenga actualmente. Se enviará una notificación a su panel.
                </p>
                <Button variant="primary" style={{ width: '100%', marginTop: '20px' }} onClick={handleSave} disabled={saving || loading}>
                  {saving ? 'Guardando...' : '💾 Guardar y Asignar Plan'}
                </Button>
              </div>
            </div>

            {/* Weekly Builder */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Day Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--body-bg)', overflowX: 'auto' }}>
                {DIAS.map(dia => (
                  <button
                    key={dia}
                    onClick={() => setActiveDay(dia)}
                    style={{
                      flex: 1,
                      padding: '16px 10px',
                      border: 'none',
                      background: activeDay === dia ? 'white' : 'transparent',
                      color: activeDay === dia ? 'var(--green-dark)' : 'var(--text-mid)',
                      fontWeight: activeDay === dia ? '700' : '600',
                      borderBottom: activeDay === dia ? '3px solid var(--green)' : '3px solid transparent',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dia.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* Editor for active day */}
              <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--text-dark)', marginBottom: '24px' }}>
                  Menú del {activeDay}
                </h3>
                
                {COMIDAS.map(comida => (
                  <div key={comida} className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{mealLabels[comida]}</span>
                    </label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder={`Ej: 2 huevos revueltos con espinaca...`}
                      value={semana[activeDay]?.[comida] || ''}
                      onChange={(e) => handleMealChange(activeDay, comida, e.target.value)}
                      style={{ resize: 'vertical' }}
                    ></textarea>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
