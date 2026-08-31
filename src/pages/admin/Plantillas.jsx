import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { getPlantillas, createPlantilla, updatePlantilla, deletePlantilla } from '../../lib/storage';

export default function Plantillas() {
  const { addToast } = useToast();
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const initialForm = {
    nombre: '', objetivo: 'sana', desc: '', 
    calorias: 2000, prot: 25, carb: 50, gras: 25, 
    duracion: 30, precio: 0, estado: 'activo'
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    const data = await getPlantillas();
    setPlantillas(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (plantilla = null) => {
    if (plantilla) {
      setEditingId(plantilla.id);
      setFormData({ ...plantilla });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Macro validation
    const totalMacros = Number(formData.prot) + Number(formData.carb) + Number(formData.gras);
    if (totalMacros !== 100) {
      addToast(`Error: Los macronutrientes suman ${totalMacros}%. Deben sumar exactamente 100%.`, 'error');
      return;
    }

    try {
      if (editingId) {
        await updatePlantilla(editingId, formData);
        addToast('Plantilla actualizada.', 'success');
      } else {
        await createPlantilla(formData);
        addToast('Plantilla creada exitosamente.', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deletePlantilla(deletingId);
    addToast('Plantilla eliminada.', 'success');
    setDeletingId(null);
    loadData();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar admin={true} />
      <main className="main-content">
        <Topbar title="Plantillas de Dietas" />
        
        <div className="content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 className="section-title" style={{ margin: 0 }}>Gestión de Plantillas</h1>
            <Button onClick={() => openModal()}>+ Nueva Plantilla</Button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-mid)' }}>Cargando...</div>
          )}

          <div className="grid-3">
            {!loading && plantillas.map(pl => (
              <div key={pl.id} className="card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--green-dark)', margin: 0 }}>{pl.nombre}</h3>
                  <span className={`badge ${pl.estado === 'activo' ? 'badge-green' : 'badge-gray'}`}>
                    {pl.estado}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-mid)', fontSize: '13px', marginBottom: '16px', flex: 1 }}>
                  {pl.desc.substring(0, 100)}...
                </p>

                <div style={{ background: 'var(--body-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                    <span>{pl.calorias} kcal</span>
                    <span>{pl.duracion} días</span>
                  </div>
                  <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pl.prot}%`, background: 'var(--blue)' }} title={`Prot: ${pl.prot}%`}></div>
                    <div style={{ width: `${pl.carb}%`, background: 'var(--orange)' }} title={`Carb: ${pl.carb}%`}></div>
                    <div style={{ width: `${pl.gras}%`, background: 'var(--red)' }} title={`Gras: ${pl.gras}%`}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px', color: 'var(--text-mid)' }}>
                    <span>P: {pl.prot}%</span>
                    <span>C: {pl.carb}%</span>
                    <span>G: {pl.gras}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>
                    ${pl.precio.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" size="sm" onClick={() => openModal(pl)}>Editar</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingId(pl.id)} style={{ color: 'var(--red)', padding: '4px' }}>
                      <span title="Eliminar">🗑️</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? 'Editar Plantilla' : 'Nueva Plantilla'}
        maxWidth="700px"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <Input label="Nombre de Plantilla" name="nombre" value={formData.nombre} onChange={handleChange} required />
            <div className="form-group">
              <label className="form-label">Objetivo</label>
              <select name="objetivo" className="form-control" value={formData.objetivo} onChange={handleChange}>
                <option value="sana">Saludable</option>
                <option value="bajar">Pérdida de Peso</option>
                <option value="musculo">Masa Muscular</option>
                <option value="keto">Keto</option>
                <option value="eco">Basada en Plantas</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea 
              name="desc" 
              className="form-control" 
              value={formData.desc} 
              onChange={handleChange} 
              rows="3" 
              required
            ></textarea>
          </div>

          <h3 style={{ fontSize: '14px', color: 'var(--text-dark)', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Distribución Nutricional
          </h3>
          
          <div className="grid-3">
            <Input label="Proteínas (%)" name="prot" type="number" min="0" max="100" value={formData.prot} onChange={handleChange} required />
            <Input label="Carbohidratos (%)" name="carb" type="number" min="0" max="100" value={formData.carb} onChange={handleChange} required />
            <Input label="Grasas (%)" name="gras" type="number" min="0" max="100" value={formData.gras} onChange={handleChange} required />
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600',
            textAlign: 'right', 
            marginTop: '-10px', 
            marginBottom: '20px',
            color: (Number(formData.prot) + Number(formData.carb) + Number(formData.gras)) === 100 ? 'var(--green)' : 'var(--red)' 
          }}>
            Total Macros: {Number(formData.prot) + Number(formData.carb) + Number(formData.gras)}% (Debe ser 100%)
          </div>

          <h3 style={{ fontSize: '14px', color: 'var(--text-dark)', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Comercial
          </h3>

          <div className="grid-3">
            <Input label="Calorías Diarias" name="calorias" type="number" min="500" value={formData.calorias} onChange={handleChange} required />
            <Input label="Duración (días)" name="duracion" type="number" min="1" value={formData.duracion} onChange={handleChange} required />
            <Input label="Precio ($)" name="precio" type="number" step="0.01" min="0" value={formData.precio} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <select name="estado" className="form-control" value={formData.estado} onChange={handleChange}>
              <option value="activo">Activo (Visible en catálogo)</option>
              <option value="inactivo">Inactivo (Oculto)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '32px' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{editingId ? 'Guardar Cambios' : 'Crear Plantilla'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Eliminar Plantilla"
        message="¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no afectará a los pacientes que ya tienen esta dieta asignada, pero la eliminará del catálogo."
      />
    </div>
  );
}
