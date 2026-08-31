import React from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public Navbar */}
      <header style={{
        background: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--green-dark)' }}>🍏 GreenBite</div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontWeight: '600', color: 'var(--text-mid)' }}>
          <Link to="/" style={{ color: 'var(--green)' }}>Inicio</Link>
          <Link to="/catalogo" className="menu-item" style={{ padding: 0 }}>Catálogo</Link>
          <Link to="/acerca" className="menu-item" style={{ padding: 0 }}>Nosotros</Link>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Hola, {user?.nombre?.split(' ')[0]}</span>
              <Link to={user?.rol === 'admin' ? '/admin' : '/paciente'} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                Mi Panel
              </Link>
              <button onClick={logout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red)', fontWeight: '600' }}>Salir</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>Ingresar</Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{
          background: 'linear-gradient(135deg, var(--green-light) 0%, var(--blue-soft) 100%)',
          padding: '100px 20px', textAlign: 'center', overflow: 'hidden'
        }}>
          <div className="container animate-slide-up">
            <h1 style={{ fontSize: '56px', fontWeight: '800', color: 'var(--green-dark)', marginBottom: '24px', lineHeight: 1.1 }}>
              Nutrición Inteligente para<br/>una Vida Más Saludable
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--text-mid)', maxWidth: '600px', margin: '0 auto 40px auto' }}>
              Descubre planes nutricionales diseñados por expertos, personalizados para tus objetivos y estilo de vida.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to="/catalogo" className="btn btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>Explorar Planes</Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn btn-outline" style={{ fontSize: '18px', padding: '16px 32px', background: 'white' }}>Crear Cuenta</Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="container" style={{ padding: '80px 20px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '48px' }}>¿Por qué elegir GreenBite?</h2>
          <div className="grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥗</div>
              <h3 style={{ fontSize: '18px', color: 'var(--green-dark)', marginBottom: '12px' }}>Planes Personalizados</h3>
              <p style={{ color: 'var(--text-mid)', fontSize: '15px' }}>Adaptados a tus requerimientos calóricos, objetivos y preferencias.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
              <h3 style={{ fontSize: '18px', color: 'var(--green-dark)', marginBottom: '12px' }}>Seguimiento de Progreso</h3>
              <p style={{ color: 'var(--text-mid)', fontSize: '15px' }}>Visualiza tu evolución, registra tu peso y marca tus comidas completadas.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
              <h3 style={{ fontSize: '18px', color: 'var(--green-dark)', marginBottom: '12px' }}>Pagos Seguros</h3>
              <p style={{ color: 'var(--text-mid)', fontSize: '15px' }}>Solicita cotizaciones y paga tus planes fácilmente desde la plataforma.</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: 'var(--text-dark)', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
        <div className="container">
          <p style={{ opacity: 0.7 }}>&copy; 2026 GreenBite. Todos los derechos reservados. | Proyecto Semestral Calidad de Software</p>
        </div>
      </footer>
    </div>
  );
}
