import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../lib/AuthContext';
import { 
  getPlanActivo, 
  getCumplimientoSemanal, 
  getCotizacionesByPaciente,
  getPesoHistorial 
} from '../../lib/storage';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [planActivo, setPlanActivo] = useState(null);
  const [cumplimiento, setCumplimiento] = useState({ completed: 0, total: 0, percent: 0 });
  const [quotesCount, setQuotesCount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [plan, cumplimientoSemanal, cotizaciones, historial] = await Promise.all([
        getPlanActivo(user.id),
        getCumplimientoSemanal(user.id),
        getCotizacionesByPaciente(user.id),
        getPesoHistorial(user.id),
      ]);
      setPlanActivo(plan);
      setCumplimiento(cumplimientoSemanal);
      setQuotesCount(cotizaciones.filter(c => c.estado === 'Pendiente').length);

      const data = historial.map(h => ({
        fecha: new Date(h.fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        peso: h.peso
      }));
      setChartData(data);
      setLoading(false);
    }
    loadData();
  }, [user.id]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Mi Panel de Progreso" />
        
        <div className="content-area">
          <h1 className="section-title">Hola de nuevo, {user.nombre.split(' ')[0]} 👋</h1>

          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-mid)' }}>Cargando...</div>
          )}

          {/* Top stats */}
          <div className="grid-3 mb-30">
            <div className="card">
              <div style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '8px' }}>Plan Actual</div>
              {planActivo ? (
                <>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green-dark)' }}>{planActivo.nombre}</div>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <Link to="/paciente/dietas" style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: '600' }}>Ver dieta de hoy &rarr;</Link>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-mid)' }}>Ningún plan activo</div>
                  <Link to="/paciente/catalogo" style={{ display: 'inline-block', marginTop: '16px', color: 'var(--blue)', fontSize: '14px', fontWeight: '600' }}>Explorar catálogo &rarr;</Link>
                </>
              )}
            </div>
            
            <div className="card">
              <div style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '8px' }}>Cumplimiento Semanal</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-dark)' }}>{cumplimiento.percent}%</div>
              
              {/* Progress bar */}
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '16px' }}>
                <div style={{ height: '100%', width: `${cumplimiento.percent}%`, background: 'var(--green)' }}></div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '8px' }}>Acciones Pendientes</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {quotesCount > 0 ? (
                  <div style={{ fontSize: '16px' }}>
                    Tienes <strong style={{ color: 'var(--orange)' }}>{quotesCount} cotizaciones</strong> pendientes por pagar.
                    <br/><br/>
                    <Link to="/paciente/pagos" style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: '600' }}>Ver mis pagos &rarr;</Link>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-light)', fontSize: '14px' }}>Todo al día. No tienes acciones pendientes.</div>
                )}
              </div>
            </div>
          </div>

          {/* Charts section */}
          <div className="grid-2">
            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--text-dark)' }}>Evolución de Peso</h3>
              {chartData.length > 1 ? (
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-mid)' }} />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-mid)' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} kg`, 'Peso']}
                      />
                      <Line type="monotone" dataKey="peso" stroke="var(--green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--green)' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState icon="📈" title="Sin datos suficientes" description="Actualiza tu peso en el perfil para ver tu gráfica." />
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-dark)' }}>Accesos Rápidos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/paciente/perfil" style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>👤 Mi Perfil de Salud</span>
                  <span style={{ color: 'var(--text-light)' }}>&rarr;</span>
                </Link>
                <Link to="/paciente/catalogo" style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>🥗 Catálogo de Planes</span>
                  <span style={{ color: 'var(--text-light)' }}>&rarr;</span>
                </Link>
                <Link to="/paciente/pagos" style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>💳 Mis Pagos y Cotizaciones</span>
                  <span style={{ color: 'var(--text-light)' }}>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
