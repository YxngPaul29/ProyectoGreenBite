import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toastColors = {
    success: { bg: 'var(--green-light)', border: 'var(--green)', text: 'var(--green-dark)' },
    error: { bg: 'var(--red-soft)', border: 'var(--red)', text: 'var(--red)' },
    warning: { bg: 'var(--orange-soft)', border: 'var(--orange)', text: 'var(--orange)' },
    info: { bg: 'white', border: 'var(--border)', text: 'var(--text-dark)' },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        {toasts.map((toast) => {
          const colors = toastColors[toast.type] || toastColors.info;
          return (
            <div 
              key={toast.id}
              className="animate-slide-up"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                padding: '12px 20px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', gap: '10px',
                minWidth: '250px',
                fontSize: '14px', fontWeight: '600'
              }}
            >
              <span>{toastIcons[toast.type]}</span>
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '16px' }}
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
