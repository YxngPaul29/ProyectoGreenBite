import { supabase } from './supabase';

/* ============================================================
   GreenBite — Capa Centralizada de Almacenamiento (Supabase)
   ============================================================ */

/* ── Helpers ── */

export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function toNumber(val, fallback = 0) {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function readRows(data, error, resource) {
  if (error) throw new Error(`No se pudieron cargar ${resource}: ${error.message}`);
  if (data == null) return [];
  if (!Array.isArray(data)) throw new Error(`Respuesta inválida al cargar ${resource}.`);
  return data;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); // Deprecated when using UUID in db, kept for fallback
}

function generateTransactionRef() {
  return 'GB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

/* ── Migration from legacy keys ── */

export async function migrateFromLegacy() {
  // Ya no migramos localStorage a local, los datos deben estar en Supabase.
  console.log('App inicializada usando Supabase.');
}

/* ============================================================
   PACIENTES
   ============================================================ */

export async function getPacientes() {
  const { data, error } = await supabase.from('pacientes').select('*').order('fechaRegistro', { ascending: false });
  return readRows(data, error, 'pacientes');
}

export async function getPacienteById(id) {
  const { data, error } = await supabase.from('pacientes').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function getPacienteByEmail(email) {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase.from('pacientes').select('*').eq('email', normalized).single();
  if (error) return null;
  return data;
}

export async function createPaciente(dataObj) {
  const email = normalizeEmail(dataObj.email);
  const existing = await getPacienteByEmail(email);
  
  if (existing) {
    throw new Error('Este correo electrónico ya está registrado.');
  }

  const nuevo = {
    nombre: (dataObj.nombre || '').trim(),
    email,
    password: dataObj.password || '',
    edad: toNumber(dataObj.edad),
    sexo: dataObj.sexo || 'M',
    peso: toNumber(dataObj.peso),
    altura: toNumber(dataObj.altura),
    objetivo: dataObj.objetivo || 'sana',
    nivelActividad: dataObj.nivelActividad || 'moderado',
    estado: 'Activo',
    mustChangePassword: dataObj.mustChangePassword || false,
    rol: 'paciente',
  };

  const { data, error } = await supabase.from('pacientes').insert([nuevo]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createPacienteByAdmin(data) {
  const tempPass = generateTempPassword();
  const paciente = await createPaciente({
    ...data,
    password: tempPass,
    mustChangePassword: true,
  });
  return { paciente, tempPassword: tempPass };
}

export async function updatePaciente(id, dataObj) {
  const email = dataObj.email ? normalizeEmail(dataObj.email) : undefined;
  
  if (email) {
    const { data: existing } = await supabase.from('pacientes').select('id').eq('email', email).neq('id', id).single();
    if (existing) throw new Error('Este correo electrónico ya está registrado por otro paciente.');
  }

  const { data, error } = await supabase.from('pacientes').update(dataObj).eq('id', id).select().single();
  if (error) throw new Error('Paciente no encontrado o error al actualizar.');
  return data;
}

export async function deletePaciente(id) {
  await supabase.from('pacientes').delete().eq('id', id);
}

export async function changePassword(id, currentPass, newPass) {
  const paciente = await getPacienteById(id);
  if (!paciente) throw new Error('Paciente no encontrado.');
  if (paciente.password !== currentPass) {
    throw new Error('La contraseña actual es incorrecta.');
  }
  if (newPass.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
  }
  
  const { data, error } = await supabase.from('pacientes').update({
    password: newPass,
    mustChangePassword: false
  }).eq('id', id).select().single();
  
  if (error) throw new Error('Error al cambiar la contraseña.');
  return data;
}

/* ============================================================
   PLANTILLAS
   ============================================================ */

export async function getPlantillas() {
  const { data, error } = await supabase.from('plantillas').select('*');
  return readRows(data, error, 'plantillas');
}

export async function getPlantillaById(id) {
  const { data, error } = await supabase.from('plantillas').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function createPlantilla(dataObj) {
  const nueva = {
    nombre: (dataObj.nombre || '').trim(),
    objetivo: dataObj.objetivo || '',
    desc: (dataObj.desc || '').trim(),
    prot: toNumber(dataObj.prot),
    carb: toNumber(dataObj.carb),
    gras: toNumber(dataObj.gras),
    calorias: toNumber(dataObj.calorias, 2000),
    duracion: toNumber(dataObj.duracion, 30),
    precio: toNumber(dataObj.precio, 0),
    estado: 'activo',
  };
  const { data, error } = await supabase.from('plantillas').insert([nueva]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePlantilla(id, dataObj) {
  const { data, error } = await supabase.from('plantillas').update(dataObj).eq('id', id).select().single();
  if (error) throw new Error('Plantilla no encontrada.');
  return data;
}

export async function deletePlantilla(id) {
  await supabase.from('plantillas').delete().eq('id', id);
}

/* ============================================================
   PLANES (dietas asignadas a pacientes)
   ============================================================ */

export async function getPlanes() {
  const { data, error } = await supabase.from('planes').select('*').order('fecha', { ascending: false });
  return readRows(data, error, 'planes');
}

export async function getPlanesByPaciente(pacienteId) {
  const { data, error } = await supabase.from('planes').select('*').eq('pacienteId', pacienteId).order('fecha', { ascending: false });
  return readRows(data, error, 'planes del paciente');
}

export async function getPlanActivo(pacienteId) {
  const { data, error } = await supabase.from('planes').select('*').eq('pacienteId', pacienteId).eq('estado', 'Activo').order('fecha', { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el plan activo: ${error.message}`);
  return data;
}

export async function createPlan(dataObj) {
  // Deactivate previous active plans for this patient
  await supabase.from('planes').update({ estado: 'Completado' }).eq('pacienteId', dataObj.pacienteId).eq('estado', 'Activo');

  const nuevo = {
    pacienteId: dataObj.pacienteId,
    nombre: dataObj.nombre || 'Plan Personalizado',
    plantillaId: dataObj.plantillaId || null,
    estado: 'Activo',
    fechaFin: dataObj.fechaFin || null,
    semana: dataObj.semana || {},
  };

  const { data, error } = await supabase.from('planes').insert([nuevo]).select().single();
  if (error) throw new Error(error.message);

  // Add notification
  await addNotification({
    tipo: 'plan_asignado',
    mensaje: `Se ha asignado el plan "${nuevo.nombre}".`,
    pacienteId: dataObj.pacienteId,
  });

  return data;
}

/* ============================================================
   COTIZACIONES
   ============================================================ */

export async function getCotizaciones() {
  const { data, error } = await supabase.from('cotizaciones').select('*').order('fecha', { ascending: false });
  return readRows(data, error, 'cotizaciones');
}

export async function getCotizacionesByPaciente(pacienteId) {
  const { data, error } = await supabase.from('cotizaciones').select('*').eq('pacienteId', pacienteId).order('fecha', { ascending: false });
  return readRows(data, error, 'cotizaciones del paciente');
}

export async function createCotizacion(dataObj) {
  const nueva = {
    pacienteId: dataObj.pacienteId,
    plantillaId: dataObj.plantillaId,
    planNombre: dataObj.planNombre || '',
    precio: toNumber(dataObj.precio),
    fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    estado: 'Pendiente',
  };
  const { data, error } = await supabase.from('cotizaciones').insert([nueva]).select().single();
  if (error) throw new Error(error.message);

  await addNotification({
    tipo: 'cotizacion_creada',
    mensaje: `Nueva cotización para el plan "${nueva.planNombre}" por $${nueva.precio.toFixed(2)}.`,
    pacienteId: dataObj.pacienteId,
  });

  return data;
}

export async function updateCotizacion(id, dataObj) {
  if (dataObj.estado === 'Pagada') {
    const { data: cotiz } = await supabase.from('cotizaciones').select('fechaExpiracion').eq('id', id).single();
    if (cotiz && new Date(cotiz.fechaExpiracion) < new Date()) {
      await supabase.from('cotizaciones').update({ estado: 'Expirada' }).eq('id', id);
      throw new Error('Esta cotización ha expirado y no se puede pagar.');
    }
  }

  const { data, error } = await supabase.from('cotizaciones').update(dataObj).eq('id', id).select().single();
  if (error) throw new Error('Cotización no encontrada.');
  return data;
}

export async function checkExpiredCotizaciones() {
  const { data, error } = await supabase.from('cotizaciones').select('id, fechaExpiracion').eq('estado', 'Pendiente');
  const cotizaciones = readRows(data, error, 'cotizaciones pendientes');
  const now = new Date();
  const expiredIds = cotizaciones.filter(c => new Date(c.fechaExpiracion) < now).map(c => c.id);
  if (expiredIds.length > 0) {
    const { error: updateError } = await supabase.from('cotizaciones').update({ estado: 'Expirada' }).in('id', expiredIds);
    if (updateError) throw new Error(`No se pudieron actualizar las cotizaciones expiradas: ${updateError.message}`);
  }
}

/* ============================================================
   PAGOS
   ============================================================ */

export async function getPagos() {
  const { data, error } = await supabase.from('pagos').select('*').order('fecha', { ascending: false });
  return readRows(data, error, 'pagos');
}

export async function getPagosByPaciente(pacienteId) {
  const { data, error } = await supabase.from('pagos').select('*').eq('pacienteId', pacienteId).order('fecha', { ascending: false });
  return readRows(data, error, 'pagos del paciente');
}

export async function createPago(dataObj) {
  const nuevo = {
    cotizacionId: dataObj.cotizacionId,
    pacienteId: dataObj.pacienteId,
    planNombre: dataObj.planNombre || '',
    monto: toNumber(dataObj.monto),
    metodo: dataObj.metodo || 'Tarjeta',
    tarjetaUltimos4: dataObj.tarjetaUltimos4 || '****',
    referencia: generateTransactionRef(),
    estado: dataObj.estado || 'Pendiente',
  };
  const { data, error } = await supabase.from('pagos').insert([nuevo]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePago(id, dataObj) {
  const { data, error } = await supabase.from('pagos').update(dataObj).eq('id', id).select().single();
  if (error) throw new Error('Pago no encontrado.');
  return data;
}

/* ============================================================
   NOTIFICACIONES
   ============================================================ */

export async function getNotificaciones() {
  const { data, error } = await supabase.from('notificaciones').select('*').order('fecha', { ascending: false });
  return readRows(data, error, 'notificaciones');
}

export async function getNotificacionesByPaciente(pacienteId) {
  const { data, error } = await supabase.from('notificaciones').select('*').or(`pacienteId.eq.${pacienteId},tipo.eq.global`).order('fecha', { ascending: false });
  return readRows(data, error, 'notificaciones del paciente');
}

export async function getUnreadNotificaciones(pacienteId) {
  const notifs = await getNotificacionesByPaciente(pacienteId);
  return notifs.filter(n => !n.leida);
}

export async function addNotification(dataObj) {
  const { error } = await supabase.from('notificaciones').insert([{
    tipo: dataObj.tipo || 'general',
    mensaje: dataObj.mensaje || '',
    pacienteId: dataObj.pacienteId || null,
    leida: false,
  }]);
  if (error) console.error(error);
}

export async function markNotificationRead(id) {
  await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
}

export async function markAllNotificationsRead(pacienteId) {
  await supabase.from('notificaciones').update({ leida: true }).or(`pacienteId.eq.${pacienteId},tipo.eq.global`);
}

export async function getAdminNotificaciones() {
  const { data, error } = await supabase.from('notificaciones').select('*').in('tipo', ['solicitud', 'admin']).or('pacienteId.is.null').order('fecha', { ascending: false });
  return readRows(data, error, 'notificaciones de administración');
}

/* ============================================================
   CUMPLIMIENTO (tracking de comidas completadas)
   ============================================================ */

export async function getCumplimiento(pacienteId) {
  const { data, error } = await supabase.from('cumplimiento').select('*').eq('pacienteId', pacienteId);
  const rows = readRows(data, error, 'cumplimiento del paciente');
  
  const result = {};
  rows.forEach(row => {
    if (!result[row.dia]) result[row.dia] = {};
    result[row.dia][row.comidaId] = row.completado;
  });
  return result;
}

export async function setCumplimiento(pacienteId, dia, comidaId, completado) {
  const { data: existing } = await supabase.from('cumplimiento').select('id').eq('pacienteId', pacienteId).eq('dia', dia).eq('comidaId', comidaId).single();
  
  if (existing) {
    await supabase.from('cumplimiento').update({ completado }).eq('id', existing.id);
  } else {
    await supabase.from('cumplimiento').insert([{ pacienteId, dia, comidaId, completado }]);
  }
}

export async function getCumplimientoDiario(pacienteId, dia) {
  const { data, error } = await supabase.from('cumplimiento').select('completado').eq('pacienteId', pacienteId).eq('dia', dia);
  const total = 5;
  const rows = readRows(data, error, 'cumplimiento diario');
  
  const completed = rows.filter(r => r.completado).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

export async function getCumplimientoSemanal(pacienteId) {
  const { data, error } = await supabase.from('cumplimiento').select('completado').eq('pacienteId', pacienteId);
  const total = 35; // 7 days × 5 meals
  const rows = readRows(data, error, 'cumplimiento semanal');
  
  const completed = rows.filter(r => r.completado).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

/* ============================================================
   HISTORIAL DE PESO
   ============================================================ */

export async function getPesoHistorial(pacienteId) {
  const { data, error } = await supabase.from('peso_historial').select('*').eq('pacienteId', pacienteId).order('fecha', { ascending: true });
  return readRows(data, error, 'historial de peso');
}

export async function addPesoHistorial(pacienteId, peso) {
  await supabase.from('peso_historial').insert([{ pacienteId, peso: toNumber(peso) }]);
}

/* ============================================================
   SESIÓN ACTUAL (mantenido en localStorage para no romper Auth por ahora)
   ============================================================ */
const USER_KEY = 'gb_usuario_actual';

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
}

export function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}

/* ============================================================
   UTILIDADES EXPORTADAS
   ============================================================ */

export { generateId, generateTransactionRef, generateTempPassword, toNumber };
