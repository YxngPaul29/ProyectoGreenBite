import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getPlantillas } from '../lib/storage';
import PlanDetailModal from '../components/PlanDetailModal';
import Button from '../components/Button';
import Topbar from '../components/Topbar'; // We reuse topbar for authenticated users

export default function Catalogo() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
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
        // Load active plans only
        const data = await getPlantillas();
        setPlantillas(data.filter(p => p.estado === 'activo'));
      } catch (err) {
        console.error('Error al cargar el catálogo:', err);
        setLoadError(err.message || 'No se pudo cargar el catálogo.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPlans = plantillas.filter(p => {
    if (filter === 'todos') return true;
    const objective = p.objetivo === 'peso' ? 'bajar' : p.objetivo;
    return objective === filter;
  });

  const handleAction = (plan) => {
    if (isAuthenticated) {
      navigate('/paciente/catalogo', { state: { selectedPlanId: plan.id } });
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--body-bg)' }}>
      {/* Navbar for Public View */}
      {!isAuthenticated && (
        <header style={{
          background: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border)'
        }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--green-dark)' }}>🍏 GreenBite</Link>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/" className="menu-item" style={{ padding: 0 }}>Inicio</Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px' }}>Ingresar</Link>
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>Registrarse</Link>
          </div>
        </header>
      )}

      {isAuthenticated && user?.rol === 'paciente' && (
        <header style={{ background: 'white', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/paciente" style={{ fontWeight: '600', color: 'var(--green-dark)' }}>&larr; Volver a mi panel</Link>
            </div>
        </header>
      )}

      <main className="container" style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--green-dark)', marginBottom: '16px' }}>
            Catálogo de Planes Nutricionales
          </h1>
          <p style={{ color: 'var(--text-mid)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Elige el plan que mejor se adapte a tus objetivos.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <Button variant={filter === 'todos' ? 'primary' : 'outline'} onClick={() => setFilter('todos')}>Todos</Button>
          <Button variant={filter === 'bajar' ? 'primary' : 'outline'} onClick={() => setFilter('bajar')}>Pérdida de Peso</Button>
          <Button variant={filter === 'musculo' ? 'primary' : 'outline'} onClick={() => setFilter('musculo')}>Masa Muscular</Button>
          <Button variant={filter === 'sana' ? 'primary' : 'outline'} onClick={() => setFilter('sana')}>Saludable</Button>
          <Button variant={filter === 'eco' ? 'primary' : 'outline'} onClick={() => setFilter('eco')}>Plant Based</Button>
          <Button variant={filter === 'keto' ? 'primary' : 'outline'} onClick={() => setFilter('keto')}>Keto</Button>
        </div>

        {/* Grid */}
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
              <h3 style={{ fontSize: '20px', color: 'var(--green-dark)', marginBottom: '8px' }}>{plan.nombre}</h3>
              <span className="badge badge-green" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
                {plan.objetivo.toUpperCase()}
              </span>
              <p style={{ color: 'var(--text-mid)', fontSize: '14px', flex: 1, marginBottom: '24px' }}>
                {plan.desc.substring(0, 100)}...
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
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-mid)' }}>
            No hay planes disponibles para esta categoría actualmente.
          </div>
        )}
      </main>

      <PlanDetailModal 
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
        actionText={isAuthenticated ? 'Solicitar Cotización' : 'Ingresar para Solicitar'}
        onAction={handleAction}
      />
    </div>
  );
}
