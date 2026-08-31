import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { 
  getPacientes, createPacienteByAdmin, updatePaciente, deletePaciente, getPlanActivo 
} from '../../lib/storage';

export default function Pacientes() {
  const { addToast } = useToast();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempPassword, setTempPassword] = useState(null); // Shows when new patient is created
  
  // Confirm Delete state
  const [deletingId, setDeletingId] = useState(null);

  const initialForm = { nombre: '', email: '', edad: '', sexo: 'M', peso: '', altura: '', objetivo: 'sana', nivelActividad: 'sedentario' };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    // Add active plan to each patient object for table display
    const base = await getPacientes();
    const data = await Promise.all(base.map(async p => ({
      ...p,
      planActivo: await getPlanActivo(p.id)
    })));
    setPacientes(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredPacientes = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (paciente = null) => {
    if (paciente) {
      setEditingId(paciente.id);
      setFormData({
        nombre: paciente.nombre, email: paciente.email, edad: paciente.edad,
        sexo: paciente.sexo, peso: paciente.peso, altura: paciente.altura,
        objetivo: paciente.objetivo, nivelActividad: paciente.nivelActividad
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setTempPassword(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePaciente(editingId, formData);
        addToast('Paciente actualizado exitosamente.', 'success');
        setIsModalOpen(false);
      } else {
        const result = await createPacienteByAdmin(formData);
        setTempPassword(result.tempPassword);
        addToast('Paciente creado exitosamente.', 'success');
        // Do not close modal automatically so they can see the password
      }
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deletePaciente(deletingId);
    addToast('Paciente eliminado.', 'success');
    setDeletingId(null);
    loadData();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar admin={true} />
      <main className="main-content">
        <Topbar title="Directorio de Pacientes" />
        
        <div className="content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 className="section-title" style={{ margin: 0 }}>Pacientes Registrados</h1>
            <Button onClick={() => openModal()}>+ Nuevo Paciente</Button>
          </div>

          <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
            <Input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Edad / Peso</th>
                    <th>Plan Activo</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-mid)' }}>Cargando...</td></tr>
                  )}
                  {!loading && filteredPacientes.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600' }}>{p.nombre}</td>
                      <td>{p.email}</td>
                      <td>{p.edad} años / {p.peso} kg</td>
                      <td>
                        {p.planActivo ? (
                          <span className="badge badge-blue">{p.planActivo.nombre}</span>
                        ) : (
                          <span className="badge badge-gray">Ninguno</span>
                        )}
                      </td>
                      <td>{new Date(p.fechaRegistro).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="outline" size="sm" onClick={() => openModal(p)}>Editar</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeletingId(p.id)} style={{ color: 'var(--red)' }}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {!loading && filteredPacientes.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-mid)' }}>
                No se encontraron pacientes.
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
        maxWidth="600px"
      >
        {tempPassword ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
            <h3 style={{ color: 'var(--green-dark)', marginBottom: '8px' }}>Paciente Registrado</h3>
            <p style={{ color: 'var(--text-mid)', marginBottom: '16px' }}>Proporciona esta contraseña temporal al paciente. El sistema le pedirá cambiarla al iniciar sesión.</p>
            <div style={{ background: 'var(--border-light)', padding: '16px', fontSize: '24px', fontWeight: '800', letterSpacing: '2px', borderRadius: 'var(--radius-sm)' }}>
              {tempPassword}
            </div>
            <Button variant="primary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setIsModalOpen(false)}>Cerrar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Nombre Completo" name="nombre" value={formData.nombre} onChange={handleChange} required />
              <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} required />
              
              <Input label="Edad" name="edad" type="number" min="0" value={formData.edad} onChange={handleChange} required />
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select name="sexo" className="form-control" value={formData.sexo} onChange={handleChange}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <Input label="Peso (kg)" name="peso" type="number" step="0.1" min="0" value={formData.peso} onChange={handleChange} required />
              <Input label="Altura (cm)" name="altura" type="number" min="0" value={formData.altura} onChange={handleChange} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" type="submit">{editingId ? 'Guardar Cambios' : 'Registrar Paciente'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Eliminar Paciente"
        message="¿Estás seguro de que deseas eliminar este paciente? Esta acción borrará permanentemente sus dietas, historial de peso y datos de acceso."
        confirmText="Eliminar Paciente"
      />
    </div>
  );
}
