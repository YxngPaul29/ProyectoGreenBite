import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  getUnreadNotificaciones, 
  getNotificacionesByPaciente, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../lib/storage';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  
  const isPaciente = user?.rol === 'paciente';
  
  const loadNotifications = async () => {
    if (isPaciente) {
      const data = await getNotificacionesByPaciente(user.id);
      setNotifications(data);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const getInitials = (name) => {
    if (!name) return '--';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(user.id);
    loadNotifications();
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Notification Bell */}
        {isPaciente && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
              style={{ cursor: 'pointer', fontSize: '20px', position: 'relative' }}
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) loadNotifications();
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-8px',
                  background: 'var(--red)', color: 'white',
                  fontSize: '10px', fontWeight: '700',
                  padding: '2px 6px', borderRadius: '10px'
                }}>
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Dropdown Menu */}
            {showNotifications && (
              <div className="card animate-slide-up" style={{
                position: 'absolute', top: '40px', right: '-10px', width: '350px',
                padding: '0', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', margin: 0 }}>Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div 
                      key={notif.id}
                      style={{ 
                        padding: '16px', 
                        borderBottom: '1px solid var(--border-light)',
                        background: notif.leida ? 'transparent' : 'var(--blue-soft)',
                        display: 'flex', gap: '12px'
                      }}
                    >
                      <div style={{ fontSize: '20px' }}>
                        {notif.tipo === 'plan' ? '📋' : (notif.tipo === 'pago' ? '💳' : '🔔')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-dark)', marginBottom: '4px' }}>
                          {notif.mensaje}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{new Date(notif.fecha).toLocaleString()}</span>
                          {!notif.leida && (
                            <button 
                              onClick={(e) => handleMarkRead(e, notif.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', padding: 0 }}
                            >
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-mid)', fontSize: '13px' }}>
                      No tienes notificaciones recientes.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>
              {user?.nombre || 'Cargando...'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-mid)' }}>
              {user?.rol === 'admin' ? 'Nutricionista Administradora' : 'Paciente Registrado'}
            </div>
          </div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: user?.rol === 'admin' ? 'var(--green)' : 'var(--blue)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700'
          }}>
            {getInitials(user?.nombre)}
          </div>
        </div>
      </div>
    </header>
  );
}
