import React from 'react';
import Button from './Button';

export default function PlanDetailModal({ isOpen, onClose, plan, onAction, actionText }) {
  if (!plan) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: isOpen ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="card animate-slide-up"
        style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--green-dark)', marginBottom: '8px' }}>
              {plan.nombre}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
          </div>
          <span className="badge badge-green">Objetivo: {plan.objetivo.toUpperCase()}</span>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-mid)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
            {plan.desc}
          </p>

          <div style={{ background: 'var(--body-bg)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-mid)', marginBottom: '16px', letterSpacing: '0.05em' }}>
              Información Nutricional
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600' }}>Calorías Diarias:</span>
              <span>{plan.calorias} kcal</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${plan.prot}%`, background: 'var(--blue)' }} title={`Proteínas: ${plan.prot}%`}></div>
              <div style={{ width: `${plan.carb}%`, background: 'var(--orange)' }} title={`Carbohidratos: ${plan.carb}%`}></div>
              <div style={{ width: `${plan.gras}%`, background: 'var(--red)' }} title={`Grasas: ${plan.gras}%`}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-mid)' }}>
              <span><strong style={{ color: 'var(--blue)' }}>■</strong> Prot: {plan.prot}%</span>
              <span><strong style={{ color: 'var(--orange)' }}>■</strong> Carb: {plan.carb}%</span>
              <span><strong style={{ color: 'var(--red)' }}>■</strong> Grasas: {plan.gras}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px dashed var(--border)' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-mid)', textTransform: 'uppercase' }}>Duración</div>
              <div style={{ fontWeight: '600' }}>{plan.duracion} días</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-mid)', textTransform: 'uppercase' }}>Inversión</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--green-dark)' }}>${plan.precio.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {actionText && (
          <div style={{ padding: '20px 24px', background: 'var(--green-light)', borderTop: '1px solid var(--border)' }}>
            <Button variant="primary" style={{ width: '100%', padding: '14px' }} onClick={() => { onAction(plan); onClose(); }}>
              {actionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
