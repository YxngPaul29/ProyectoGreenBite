import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import PlanDetailModal from '../../components/PlanDetailModal';
import Button from '../../components/Button';
import { getPlantillas, createCotizacion } from '../../lib/storage';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../components/Toast';

export default function CatalogoPaciente() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const stateSelectedId = location.state?.selectedPlanId;

  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await getPlantillas();
        const all = data.filter(p => p.estado === 'activo');
        setPlantillas(all);

        if (stateSelectedId) {
          const p = all.find(x => x.id === stateSelectedId);
          if (p) setSelectedPlan(p);
        }
      } catch (err) {
        console.error('Error al cargar el catálogo del paciente:', err);
        setLoadError(err.message || 'No se pudo cargar el catálogo.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [stateSelectedId]);

  const filteredPlans = plantillas.filter(p => {
    if (filter === 'todos') return true;
    const objective = p.objetivo === 'peso' ? 'bajar' : p.objetivo;
    return objective === filter;
  });

  const handleSolicitar = async (plan) => {
    try {
      await createCotizacion({
        pacienteId: user.id,
        plantillaId: plan.id,
        planNombre: plan.nombre,
        precio: plan.precio,
      });
      addToast(`Cotización solicitada para ${plan.nombre}. Puedes pagarla en tu panel de pagos.`, 'success', 5000);
      navigate('/paciente/pagos');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Catálogo de Planes" />
        
        <div className="content-area">
          <div style={{ marginBottom: '32px' }}>
            <h1 className="section-title">Explorar Planes</h1>
            <p style={{ color: 'var(--text-mid)' }}>Encuentra el plan perfecto para continuar tu progreso.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <Button variant={filter === 'todos' ? 'primary' : 'outline'} onClick={() => setFilter('todos')}>Todos</Button>
            <Button variant={filter === 'bajar' ? 'primary' : 'outline'} onClick={() => setFilter('bajar')}>Pérdida de Peso</Button>
            <Button variant={filter === 'musculo' ? 'primary' : 'outline'} onClick={() => setFilter('musculo')}>Masa Muscular</Button>
            <Button variant={filter === 'sana' ? 'primary' : 'outline'} onClick={() => setFilter('sana')}>Saludable</Button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-mid)' }}>Cargando...</div>
          )}

          {loadError && (
            <div className="card" role="alert" style={{ marginBottom: '24px', color: 'var(--red)' }}>
              No se pudo cargar el catálogo: {loadError}
            </div>
          )}

          <div className="grid-3">
            {!loading && !loadError && filteredPlans.map(plan => (
              <div key={plan.id} className="card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--green-dark)', marginBottom: '8px' }}>{plan.nombre}</h3>
                <span className="badge badge-green" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
                  {plan.objetivo.toUpperCase()}
                </span>
                
                <p style={{ color: 'var(--text-mid)', fontSize: '14px', flex: 1, marginBottom: '24px' }}>
                  {plan.desc.substring(0, 80)}...
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>
                    ${plan.precio.toFixed(2)}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>Ver Detalles</Button>
                </div>
              </div>
            ))}
          </div>

          {!loading && !loadError && filteredPlans.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-mid)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              No hay planes disponibles para esta categoría actualmente.
            </div>
          )}
        </div>
      </main>

      <PlanDetailModal 
        isOpen={!!selectedPlan}
        onClose={() => {
          setSelectedPlan(null);
          // clear state history so it doesn't reopen on reload
          if (stateSelectedId) navigate('/paciente/catalogo', { replace: true });
        }}
        plan={selectedPlan}
        actionText="Generar Cotización"
        onAction={handleSolicitar}
      />
    </div>
  );
}
