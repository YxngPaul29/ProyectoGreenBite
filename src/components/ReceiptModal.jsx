import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { jsPDF } from 'jspdf';

export default function ReceiptModal({ isOpen, onClose, pago }) {
  if (!pago) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(4, 120, 87); // green-dark
    doc.text('GreenBite', 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Comprobante de Pago', 20, 30);
    
    // Content
    doc.setFontSize(11);
    doc.text(`Referencia: ${pago.referencia}`, 20, 50);
    doc.text(`Fecha: ${new Date(pago.fecha).toLocaleString()}`, 20, 60);
    doc.text(`Estado: ${pago.estado.toUpperCase()}`, 20, 70);
    
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    
    doc.text('Detalles del Plan:', 20, 85);
    doc.setFontSize(14);
    doc.text(`${pago.planNombre}`, 20, 95);
    
    doc.setFontSize(11);
    doc.text(`Método de Pago: Tarjeta terminada en ${pago.tarjetaUltimos4}`, 20, 110);
    
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);
    
    doc.setFontSize(16);
    doc.setTextColor(4, 120, 87);
    doc.text(`Total Pagado: $${pago.monto.toFixed(2)}`, 130, 125);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por preferir GreenBite para tu nutrición.', 20, 280);
    
    doc.save(`Recibo_GreenBite_${pago.referencia}.pdf`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante de Transacción" maxWidth="450px">
      <div id="receipt-content" style={{ 
        padding: '24px', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)',
        background: '#fff',
        backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
          <h2 style={{ fontSize: '20px', color: 'var(--green-dark)' }}>¡Pago Exitoso!</h2>
          <p style={{ color: 'var(--text-mid)', fontSize: '14px' }}>La transacción ha sido aprobada.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-mid)' }}>Referencia</span>
            <span style={{ fontWeight: '600' }}>{pago.referencia}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-mid)' }}>Fecha</span>
            <span style={{ fontWeight: '600' }}>{new Date(pago.fecha).toLocaleDateString()} {new Date(pago.fecha).toLocaleTimeString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-mid)' }}>Plan Nutricional</span>
            <span style={{ fontWeight: '600' }}>{pago.planNombre}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-mid)' }}>Método de Pago</span>
            <span style={{ fontWeight: '600' }}>Tarjeta •••• {pago.tarjetaUltimos4}</span>
          </div>
        </div>

        <div style={{ 
          borderTop: '2px dashed var(--border)', 
          paddingTop: '16px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Total</span>
          <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--green-dark)' }}>
            ${pago.monto.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <Button variant="outline" style={{ flex: 1 }} onClick={onClose}>Cerrar</Button>
        <Button variant="primary" style={{ flex: 1 }} onClick={handleDownloadPDF}>
          📥 Descargar PDF
        </Button>
      </div>
    </Modal>
  );
}
