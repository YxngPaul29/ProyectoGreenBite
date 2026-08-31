import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { getPacientes, getPlanes, getCotizaciones, getPagos, getAdminNotificaciones } from '../../lib/storage';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pacientesTotales: 0,
    planesActivos: 0,
    solicitudesPendientes: 0,
    ingresosSimulados: 0
  });

  const [recentPacientes, setRecentPacientes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [ingresosData, setIngresosData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [pacientes, planes, cotizaciones, pagos, adminNotifs] = await Promise.all([
        getPacientes(), getPlanes(), getCotizaciones(), getPagos(), getAdminNotificaciones()
      ]);

      // Stats
      const totalPagado = pagos.filter(p => p.estado === 'Pagado').reduce((acc, p) => acc + p.monto, 0);
      setStats({
        pacientesTotales: pacientes.length,
        planesActivos: planes.filter(p => p.estado === 'Activo').length,
        solicitudesPendientes: cotizaciones.filter(c => c.estado === 'Pendiente').length,
        ingresosSimulados: totalPagado
      });

      setRecentPacientes(pacientes.slice(0, 5));
      setNotificaciones(adminNotifs.slice(0, 5));

      // Simulated revenue chart data based on last 6 months
      const months = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'];
      const data = months.map(m => ({
        name: m,
        ingresos: Math.floor(Math.random() * 500) + 150, // Mock data based on months
        pacientes: Math.floor(Math.random() * 15) + 5
      }));

      // add real payments from this month
      const currentMonthTotal = pagos
        .filter(p => p.estado === 'Pagado' && new Date(p.fecha).getMonth() === new Date().getMonth())
        .reduce((acc, p) => acc + p.monto, 0);

      if (currentMonthTotal > 0) {
        data[data.length - 1].ingresos = currentMonthTotal;
      }

      setIngresosData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar admin={true} />
      <main className="main-content">
        <Topbar title="Dashboard General" />
        
        <div className="content-area">
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-mid)' }}>Cargando...</div>
          )}
          {/* Stats Grid */}
          <div className="grid-3 mb-30" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '8px' }}>Pacientes Totales</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-dark)' }}>{stats.pacientesTotales}</div>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '8px' }}>Planes Activos</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--blue)' }}>{stats.planesActivos}</div>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '8px' }}>Solicitudes Pendientes</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--orange)' }}>{stats.solicitudesPendientes}</div>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-mid)', fontSize: '14px', marginBottom: '8px' }}>Ingresos Totales (Simulados)</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--green-dark)' }}>${stats.ingresosSimulados.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid-2 mb-30">
            {/* Charts */}
            <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--text-dark)' }}>Ingresos vs Pacientes Nuevos (Últimos 6 Meses)</h3>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresosData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-mid)' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-mid)' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-mid)' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar yAxisId="left" dataKey="ingresos" fill="var(--green)" radius={[4, 4, 0, 0]} name="Ingresos ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="pacientes" stroke="var(--blue)" strokeWidth={3} name="Pacientes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-dark)' }}>Actividad Reciente</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notificaciones.length > 0 ? notificaciones.map(n => (
                  <div key={n.id} style={{ padding: '12px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontSize: '20px' }}>{n.tipo === 'solicitud' ? '📝' : (n.tipo === 'pago_aprobado' ? '💳' : '🔔')}</div>
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--text-dark)' }}>{n.mensaje}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                        {new Date(n.fecha).toLocaleDateString()} {new Date(n.fecha).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-mid)', fontSize: '14px' }}>No hay actividad reciente.</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Access Patients Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-dark)', margin: 0 }}>Pacientes Registrados Recientemente</h3>
              <Link to="/admin/pacientes" style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: '600' }}>Ver Todos &rarr;</Link>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo Electrónico</th>
                    <th>Fecha Registro</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPacientes.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600' }}>{p.nombre}</td>
                      <td>{p.email}</td>
                      <td>{new Date(p.fechaRegistro).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${p.estado === 'Activo' ? 'badge-green' : 'badge-gray'}`}>{p.estado}</span>
                      </td>
                      <td>
                        <Link to="/admin/pacientes" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>Administrar</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
