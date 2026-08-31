import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = '500px' }) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="card animate-slide-up"
        style={{
          width: '100%', maxWidth, 
          padding: 0,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--green-dark)' }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
        
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--body-bg)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
