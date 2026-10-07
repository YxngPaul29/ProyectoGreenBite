import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { useAuth } from '../../lib/AuthContext';
import { 
  getPlanActivo, 
  getCumplimientoDiario, 
  setCumplimiento, 
  getCumplimiento,
  getPlantillaById
} from '../../lib/storage';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const COMIDAS = [
  { id: 'desayuno', label: 'Desayuno', time: '07:00 - 09:00' },
  { id: 'media', label: 'Media Mañana', time: '10:30 - 11:30' },
  { id: 'almuerzo', label: 'Almuerzo', time: '13:00 - 15:00' },
  { id: 'merienda', label: 'Merienda', time: '16:30 - 18:00' },
  { id: 'cena', label: 'Cena', time: '19:30 - 21:00' },
];

export default function MisDietas() {
  const { user } = useAuth();
  
  const [plan, setPlan] = useState(null);
  const [plantilla, setPlantilla] = useState(null);
  const [activeDay, setActiveDay] = useState('');
  const [cumplimientoData, setCumplimientoData] = useState({});
  const [dayProgress, setDayProgress] = useState({ completed: 0, total: 5, percent: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setLoadError('');
      try {
        // Select current day based on actual day of week
        const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
        const mapDays = [6, 0, 1, 2, 3, 4, 5]; // Map to our DIAS array (Mon=0, Sun=6)
        const today = DIAS[mapDays[currentDayIndex]];
        setActiveDay(today);

        const active = await getPlanActivo(user.id);
        setPlan(active);

        if (active && active.plantillaId) {
          setPlantilla(await getPlantillaById(active.plantillaId));
        }

        const cumplimiento = await getCumplimiento(user.id);
        setCumplimientoData(cumplimiento);
        setDayProgress(await getCumplimientoDiario(user.id, today));
      } catch (err) {
        console.error('Error al cargar las dietas del paciente:', err);
        setLoadError(err.message || 'No se pudieron cargar las dietas del paciente.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.id]);

  const toggleMealComplete = async (comidaId) => {
    const isCompleted = isMealCompleted(activeDay, comidaId);
    await setCumplimiento(user.id, activeDay, comidaId, !isCompleted);
    // Refresh local state
    const cumplimiento = await getCumplimiento(user.id) || {};
    setCumplimientoData(cumplimiento);
    setDayProgress(await getCumplimientoDiario(user.id, activeDay));
  };

  const isMealCompleted = (dia, comidaId) => {
    if (!cumplimientoData[dia]) return false;
    return !!cumplimientoData[dia][comidaId];
  };

  useEffect(() => {
    if (activeDay) {
      getCumplimientoDiario(user.id, activeDay).then(setDayProgress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <Topbar title="Mis Dietas" />
          <div className="content-area">
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-mid)' }}>Cargando...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <Topbar title="Mis Dietas" />
          <div className="content-area">
            {loadError ? (
              <div className="card" role="alert" style={{ color: 'var(--red)' }}>
                No se pudieron cargar las dietas: {loadError}
              </div>
            ) : <EmptyState 
              icon="🍽️"
              title="Sin plan nutricional activo"
              description="Actualmente no tienes ningún plan asignado o activo. Explora nuestro catálogo y solicita uno para comenzar."
              actionText="Explorar Catálogo"
              actionLink="/paciente/catalogo"
            />}
          </div>
        </main>
      </div>
    );
  }

  const dietOfDay = plan.semana?.[activeDay] || {};

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Mi Plan Nutricional" />
        
        <div className="content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 className="section-title" style={{ marginBottom: '8px' }}>{plan.nombre}</h1>
              <div style={{ color: 'var(--text-mid)', fontSize: '14px' }}>
                Asignado el: {new Date(plan.fecha).toLocaleDateString()}
              </div>
            </div>
            {plantilla && (
              <div className="badge badge-green">Objetivo: {plantilla.objetivo.toUpperCase()}</div>
            )}
          </div>

          {/* Daily compliance progress */}
          <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Cumplimiento del {activeDay}</span>
              <span style={{ color: 'var(--text-mid)', fontSize: '14px' }}>
                {dayProgress.completed} de {dayProgress.total} comidas ({dayProgress.percent}%)
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${dayProgress.percent}%`, 
                  background: dayProgress.percent === 100 ? 'var(--green)' : 'var(--blue)',
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            {dayProgress.percent === 100 && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--green-dark)', fontWeight: '600', textAlign: 'center' }}>
                🎉 ¡Excelente trabajo! Has completado todas tus comidas de hoy.
              </div>
            )}
          </div>

          {/* Days navigation */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            {DIAS.map(dia => (
              <button
                key={dia}
                onClick={() => setActiveDay(dia)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeDay === dia ? 'var(--green-dark)' : 'var(--body-bg)',
                  color: activeDay === dia ? 'white' : 'var(--text-mid)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {dia}
              </button>
            ))}
          </div>

          {/* Meals list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {COMIDAS.map(comida => {
              const content = dietOfDay[comida.id];
              const completed = isMealCompleted(activeDay, comida.id);
              
              if (!content) return null; // Skip if no content for this meal

              return (
                <div 
                  key={comida.id} 
                  className="card animate-slide-up"
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    gap: '20px', 
                    alignItems: 'center',
                    borderLeft: completed ? '4px solid var(--green)' : '4px solid transparent',
                    opacity: completed ? 0.8 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Checkbox button */}
                  <button 
                    onClick={() => toggleMealComplete(comida.id)}
                    style={{
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      border: completed ? 'none' : '2px solid var(--border)',
                      background: completed ? 'var(--green)' : 'white',
                      color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '16px',
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}
                  >
                    {completed && '✓'}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', color: completed ? 'var(--text-mid)' : 'var(--text-dark)', margin: 0 }}>
                        {comida.label}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                        🕒 {comida.time}
                      </span>
                    </div>
                    <p style={{ 
                      color: completed ? 'var(--text-light)' : 'var(--text-mid)', 
                      fontSize: '15px', margin: 0, lineHeight: 1.5,
                      textDecoration: completed ? 'line-through' : 'none'
                    }}>
                      {content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(dietOfDay).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-mid)' }}>
              No hay comidas asignadas para este día.
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
