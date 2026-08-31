import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { validarTarjeta, procesarPagoSimulado, TARJETAS_PRUEBA } from '../lib/payments';

export default function CheckoutModal({ isOpen, onClose, cotizacion, onPaymentSuccess }) {
  const [formData, setFormData] = useState({
    numero: '',
    expiracion: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useTestCard, setUseTestCard] = useState(false);

  if (!cotizacion) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-format card number
    if (name === 'numero') {
      value = value.replace(/\D/g, '').substring(0, 16);
      const groups = value.match(/.{1,4}/g);
      value = groups ? groups.join(' ') : value;
    }
    // Auto-format MM/YY
    if (name === 'expiracion') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length > 2) {
        value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
      }
    }
    // Auto-format CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }

    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleFillTestCard = (card) => {
    setFormData({
      numero: card.numero,
      expiracion: card.exp,
      cvv: card.cvv
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validarTarjeta(formData.numero, formData.expiracion, formData.cvv);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    setLoading(true);
    
    // Simular procesamiento
    const response = await procesarPagoSimulado({
      numero: formData.numero,
      expiracion: formData.expiracion,
      cvv: formData.cvv,
      monto: cotizacion.precio
    });

    setLoading(false);

    if (response.aprobado) {
      onPaymentSuccess({
        numero: formData.numero,
        referencia: response.referencia
      });
    } else {
      setError(response.mensaje);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Completar Pago Seguro" maxWidth="500px">
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--text-dark)' }}>Resumen de Compra</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px dashed var(--border)' }}>
          <div>
            <div style={{ fontWeight: '600' }}>Plan Nutricional: {cotizacion.planNombre}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-mid)' }}>Cotización #{cotizacion.id.toUpperCase()}</div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green-dark)' }}>
            ${cotizacion.precio.toFixed(2)}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'var(--red-soft)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* Tarjetas de Prueba (Solo desarrollo/demo) */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          type="button" 
          onClick={() => setUseTestCard(!useTestCard)}
          style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '12px', cursor: 'pointer', fontWeight: '600', padding: 0 }}
        >
          {useTestCard ? 'Ocultar Tarjetas de Prueba' : 'Mostrar Tarjetas de Prueba (Simulador)'}
        </button>
        
        {useTestCard && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TARJETAS_PRUEBA.map((card, i) => (
              <div 
                key={i} 
                onClick={() => handleFillTestCard(card)}
                style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', background: 'var(--body-bg)' }}
              >
                <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{card.desc}</div>
                <div style={{ color: 'var(--text-mid)' }}>{card.numero} | Exp: {card.exp} | CVV: {card.cvv}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Input 
          label="Número de Tarjeta" 
          name="numero" 
          value={formData.numero} 
          onChange={handleChange}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          required 
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input 
            label="Expiración (MM/AA)" 
            name="expiracion" 
            value={formData.expiracion} 
            onChange={handleChange}
            placeholder="MM/YY"
            maxLength={5}
            required 
          />
          <Input 
            label="Código de Seguridad (CVV)" 
            name="cvv" 
            type="password"
            value={formData.cvv} 
            onChange={handleChange}
            placeholder="123"
            maxLength={4}
            required 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '24px', letterSpacing: '10px', opacity: 0.3 }}>💳🔒🛡️</div>
        </div>

        <div style={{ background: 'var(--green-light)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <Button type="submit" variant="primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={loading}>
            {loading ? 'Procesando Pago Seguro...' : `Pagar $${cotizacion.precio.toFixed(2)}`}
          </Button>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--text-mid)' }}>
            Pagos procesados de forma segura. No almacenamos los datos de tu tarjeta.
          </div>
        </div>
      </form>
    </Modal>
  );
}
