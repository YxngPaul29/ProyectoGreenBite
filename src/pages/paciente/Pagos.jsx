import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import CheckoutModal from '../../components/CheckoutModal';
import ReceiptModal from '../../components/ReceiptModal';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../components/Toast';
import { 
  getCotizacionesByPaciente, 
  getPagosByPaciente, 
  createPago, 
  updateCotizacion,
  checkExpiredCotizaciones
} from '../../lib/storage';

export default function Pagos() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [cotizaciones, setCotizaciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendientes'); // pendientes, historial
  
  // Checkout flow state
  const [checkoutCotizacion, setCheckoutCotizacion] = useState(null);
  const [receiptPago, setReceiptPago] = useState(null);

  const loadData = async () => {
    setLoading(true);
    await checkExpiredCotizaciones(); // Auto-expire quotes if necessary
    const [cots, pagosData] = await Promise.all([
      getCotizacionesByPaciente(user.id),
      getPagosByPaciente(user.id),
    ]);
    setCotizaciones(cots);
    setPagos(pagosData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [user.id]);

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // 1. Create payment record
      const nuevoPago = await createPago({
        cotizacionId: checkoutCotizacion.id,
        pacienteId: user.id,
        planNombre: checkoutCotizacion.planNombre,
        monto: checkoutCotizacion.precio,
        metodo: 'Tarjeta',
        tarjetaUltimos4: paymentResult.numero.slice(-4),
        estado: 'Pagado'
      });

      // 2. Update quote status
      await updateCotizacion(checkoutCotizacion.id, { estado: 'Pagada' });

      // 3. UI Updates
      setCheckoutCotizacion(null);
      addToast('¡Pago procesado exitosamente!', 'success');
      loadData();
      
      // 4. Show receipt
      setReceiptPago(nuevoPago);
      setActiveTab('historial');
      
    } catch (err) {
      addToast('Error al registrar el pago: ' + err.message, 'error');
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente': return <span className="badge badge-orange">Pendiente</span>;
      case 'Pagada': case 'Pagado': return <span className="badge badge-green">Pagado</span>;
      case 'Expirada': return <span className="badge badge-gray">Expirada</span>;
      case 'Rechazado': return <span className="badge badge-red">Rechazado</span>;
      default: return <span className="badge badge-gray">{estado}</span>;
    }
  };

  const pendingQuotes = cotizaciones.filter(c => c.estado === 'Pendiente');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Cotizaciones y Pagos" />
        
        <div className="content-area">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <button 
              className={`menu-item ${activeTab === 'pendientes' ? 'active' : ''}`}
              style={{ background: 'none', borderRadius: '0', borderBottom: activeTab === 'pendientes' ? '2px solid var(--green)' : '2px solid transparent', padding: '12px 24px' }}
              onClick={() => setActiveTab('pendientes')}
            >
              Cotizaciones Pendientes ({pendingQuotes.length})
            </button>
            <button 
              className={`menu-item ${activeTab === 'historial' ? 'active' : ''}`}
              style={{ background: 'none', borderRadius: '0', borderBottom: activeTab === 'historial' ? '2px solid var(--green)' : '2px solid transparent', padding: '12px 24px' }}
              onClick={() => setActiveTab('historial')}
            >
              Historial de Pagos
            </button>
          </div>

          {activeTab === 'pendientes' && (
            <div className="animate-fade-in">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-mid)' }}>Cargando...</div>
              ) : pendingQuotes.length > 0 ? (
                <div className="grid-3">
                  {pendingQuotes.map(cot => (
                    <div key={cot.id} className="card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-mid)' }}>#{cot.id.toUpperCase()}</span>
                        {getStatusBadge(cot.estado)}
                      </div>
                      <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', marginBottom: '8px' }}>
                        {cot.planNombre}
                      </h3>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--green-dark)', marginBottom: '16px' }}>
                        ${cot.precio.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '24px' }}>
                        Expira: {new Date(cot.fechaExpiracion).toLocaleDateString()}
                      </div>
                      
                      <Button variant="primary" style={{ width: '100%' }} onClick={() => setCheckoutCotizacion(cot)}>
                        Pagar Ahora
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon="💳"
                  title="No hay cotizaciones pendientes"
                  description="No tienes pagos pendientes en este momento. Explora nuestro catálogo para iniciar un nuevo plan."
                  actionText="Explorar Catálogo"
                  actionLink="/paciente/catalogo"
                />
              )}
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="animate-fade-in">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-mid)' }}>Cargando...</div>
              ) : pagos.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Referencia</th>
                        <th>Fecha</th>
                        <th>Plan Nutricional</th>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map(pago => (
                        <tr key={pago.id}>
                          <td><strong style={{ color: 'var(--text-dark)' }}>{pago.referencia}</strong></td>
                          <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                          <td>{pago.planNombre}</td>
                          <td>{pago.metodo} •••• {pago.tarjetaUltimos4}</td>
                          <td style={{ fontWeight: '700' }}>${pago.monto.toFixed(2)}</td>
                          <td>{getStatusBadge(pago.estado)}</td>
                          <td>
                            {pago.estado === 'Pagado' && (
                              <Button variant="ghost" size="sm" onClick={() => setReceiptPago(pago)}>
                                Ver Recibo
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState 
                  icon="📋"
                  title="Sin historial de pagos"
                  description="Aún no has realizado ningún pago en la plataforma."
                />
              )}
            </div>
          )}
        </div>
      </main>

      <CheckoutModal 
        isOpen={!!checkoutCotizacion}
        onClose={() => setCheckoutCotizacion(null)}
        cotizacion={checkoutCotizacion}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ReceiptModal 
        isOpen={!!receiptPago}
        onClose={() => setReceiptPago(null)}
        pago={receiptPago}
      />
    </div>
  );
}
