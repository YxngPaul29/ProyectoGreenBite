import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { getCotizaciones, getPagos, updateCotizacion, getPacienteById, checkExpiredCotizaciones } from '../../lib/storage';

export default function Cotizaciones() {
  const { addToast } = useToast();
  
  const [cotizaciones, setCotizaciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('cotizaciones'); // cotizaciones, pagos
  
  // Canceling a quote
  const [cancelingId, setCancelingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      await checkExpiredCotizaciones();

      const [cots, pagosData] = await Promise.all([getCotizaciones(), getPagos()]);

      // Map patient names
      const allCots = await Promise.all(cots.map(async c => {
        const p = await getPacienteById(c.pacienteId);
        return { ...c, pacienteNombre: p ? p.nombre : 'Desconocido' };
      }));
      setCotizaciones(allCots);

      const allPagos = await Promise.all(pagosData.map(async p => {
        const pac = await getPacienteById(p.pacienteId);
        return { ...p, pacienteNombre: pac ? pac.nombre : 'Desconocido' };
      }));
      setPagos(allPagos);
    } catch (err) {
      console.error('Error al cargar cotizaciones y pagos:', err);
      setLoadError(err.message || 'No se pudieron cargar cotizaciones y pagos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelQuote = async () => {
    if (!cancelingId) return;
    try {
      await updateCotizacion(cancelingId, { estado: 'Cancelada' });
      addToast('Cotización cancelada exitosamente.', 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente': return <span className="badge badge-orange">Pendiente</span>;
      case 'Aceptada': case 'Pagada': case 'Pagado': return <span className="badge badge-green">{estado}</span>;
      case 'Cancelada': case 'Cancelado': return <span className="badge badge-red">{estado}</span>;
      case 'Expirada': return <span className="badge badge-gray">Expirada</span>;
      default: return <span className="badge badge-gray">{estado}</span>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar admin={true} />
      <main className="main-content">
        <Topbar title="Control de Facturación" />
        
        <div className="content-area">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <button 
              className={`menu-item ${activeTab === 'cotizaciones' ? 'active' : ''}`}
              style={{ background: 'none', borderRadius: '0', borderBottom: activeTab === 'cotizaciones' ? '2px solid var(--green)' : '2px solid transparent', padding: '12px 24px' }}
              onClick={() => setActiveTab('cotizaciones')}
            >
              Cotizaciones Emitidas
            </button>
            <button 
              className={`menu-item ${activeTab === 'pagos' ? 'active' : ''}`}
              style={{ background: 'none', borderRadius: '0', borderBottom: activeTab === 'pagos' ? '2px solid var(--green)' : '2px solid transparent', padding: '12px 24px' }}
              onClick={() => setActiveTab('pagos')}
            >
              Registro de Pagos
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadError && (
              <div role="alert" style={{ padding: '24px', color: 'var(--red)' }}>
                No se pudieron cargar cotizaciones y pagos: {loadError}
              </div>
            )}
            {activeTab === 'cotizaciones' && (
              <div className="animate-fade-in">
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-mid)' }}>Cargando...</div>
                ) : cotizaciones.length > 0 ? (
                  <div className="table-container" style={{ border: 'none' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Paciente</th>
                          <th>Plan / Servicio</th>
                          <th>Monto</th>
                          <th>Fecha / Expira</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cotizaciones.map(c => (
                          <tr key={c.id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-mid)' }}>#{c.id.toUpperCase()}</td>
                            <td style={{ fontWeight: '600' }}>{c.pacienteNombre}</td>
                            <td>{c.planNombre}</td>
                            <td style={{ fontWeight: '700' }}>${c.precio.toFixed(2)}</td>
                            <td>
                              <div>{new Date(c.fecha).toLocaleDateString()}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Exp: {new Date(c.fechaExpiracion).toLocaleDateString()}</div>
                            </td>
                            <td>{getStatusBadge(c.estado)}</td>
                            <td>
                              {c.estado === 'Pendiente' && (
                                <Button variant="ghost" size="sm" style={{ color: 'var(--red)' }} onClick={() => setCancelingId(c.id)}>
                                  Cancelar
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState icon="🧾" title="No hay cotizaciones" description="Aún no se han emitido cotizaciones en la plataforma." />
                )}
              </div>
            )}

            {activeTab === 'pagos' && (
              <div className="animate-fade-in">
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-mid)' }}>Cargando...</div>
                ) : pagos.length > 0 ? (
                  <div className="table-container" style={{ border: 'none' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Referencia</th>
                          <th>Fecha</th>
                          <th>Paciente</th>
                          <th>Plan</th>
                          <th>Método</th>
                          <th>Monto</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagos.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: '600' }}>{p.referencia}</td>
                            <td>
                              <div>{new Date(p.fecha).toLocaleDateString()}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{new Date(p.fecha).toLocaleTimeString()}</div>
                            </td>
                            <td>{p.pacienteNombre}</td>
                            <td>{p.planNombre}</td>
                            <td>{p.metodo} •••• {p.tarjetaUltimos4}</td>
                            <td style={{ fontWeight: '800', color: 'var(--green-dark)' }}>${p.monto.toFixed(2)}</td>
                            <td>{getStatusBadge(p.estado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState icon="💳" title="No hay pagos registrados" description="Aún no se han recibido pagos a través de la plataforma." />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog 
        isOpen={!!cancelingId}
        onClose={() => setCancelingId(null)}
        onConfirm={handleCancelQuote}
        title="Cancelar Cotización"
        message="¿Estás seguro de cancelar esta cotización? El paciente ya no podrá realizar el pago de la misma."
        confirmText="Sí, Cancelar Cotización"
      />
    </div>
  );
}
