-- ============================================================
-- GreenBite — Datos de Prueba (opcional)
-- ============================================================
-- Ejecuta este archivo DESPUÉS de 01_schema.sql si quieres tener
-- pacientes, planes, cotizaciones y pagos de ejemplo para probar
-- la app sin tener que crear todo a mano.
--
-- Nota: puedes ejecutar este script más de una vez sin duplicar
-- nada porque primero borra los datos existentes de estas tablas
-- (ver bloque TRUNCATE abajo). Si ya tienes datos reales que NO
-- quieres perder, no ejecutes este archivo.
-- ============================================================

truncate table
  peso_historial,
  cumplimiento,
  notificaciones,
  pagos,
  cotizaciones,
  planes,
  pacientes,
  plantillas
restart identity cascade;

-- ── Plantillas ──
insert into plantillas (nombre, objetivo, "desc", prot, carb, gras, calorias, duracion, precio, estado) values
('Déficit Sostenible', 'peso', 'Enfoque balanceado que no elimina ningún grupo alimenticio. Ideal para perder grasa corporal sin ansiedad.', 30, 40, 30, 1800, 30, 49.99, 'activo'),
('Equilibrio Verde', 'eco', 'Plan 100% basado en plantas. Rico en antioxidantes y proteínas vegetales para un bienestar integral.', 20, 50, 30, 2000, 30, 39.99, 'activo'),
('Keto Avanzado', 'keto', 'Alta ingesta de grasas saludables y muy baja en carbohidratos para activar la quema de grasa eficiente.', 25, 5, 70, 1600, 30, 59.99, 'activo'),
('Masa Muscular Pro', 'musculo', 'Diseñado para maximizar ganancia muscular con alto contenido proteico y carbohidratos complejos.', 40, 40, 20, 2800, 60, 69.99, 'activo'),
('Bienestar Integral', 'sana', 'Plan balanceado para quienes buscan mantener un estilo de vida saludable sin restricciones extremas.', 25, 45, 30, 2200, 30, 34.99, 'activo'),
('Detox Express', 'peso', 'Plan corto de 14 días enfocado en alimentos depurativos, frutas y vegetales de alto contenido hídrico.', 20, 55, 25, 1500, 14, 29.99, 'activo');

-- ── Pacientes demo (contraseña de todos: demo1234) ──
insert into pacientes (nombre, email, password, edad, sexo, peso, altura, objetivo, "nivelActividad", estado, rol, "fechaRegistro", "mustChangePassword") values
('Carlos Mendoza', 'carlos@demo.com', 'demo1234', 28, 'M', 82, 175, 'bajar', 'moderado', 'Activo', 'paciente', now() - interval '60 days', false),
('María González', 'maria@demo.com', 'demo1234', 34, 'F', 65, 162, 'sana', 'activo', 'Activo', 'paciente', now() - interval '45 days', false),
('Roberto López', 'roberto@demo.com', 'demo1234', 42, 'M', 95, 180, 'bajar', 'sedentario', 'Activo', 'paciente', now() - interval '30 days', false),
('Ana Castillo', 'ana@demo.com', 'demo1234', 25, 'F', 58, 168, 'musculo', 'activo', 'Activo', 'paciente', now() - interval '15 days', false);

-- ── Planes (dietas asignadas) ──
-- Semana "bajar" para Carlos Mendoza sobre la plantilla Déficit Sostenible
insert into planes ("pacienteId", nombre, "plantillaId", estado, fecha, "fechaFin", semana)
select
  (select id from pacientes where email = 'carlos@demo.com'),
  'Déficit Sostenible - Mes 1',
  (select id from plantillas where nombre = 'Déficit Sostenible'),
  'Activo',
  now() - interval '15 days',
  null,
  (
    select jsonb_object_agg(dia, comidas)
    from (values
      ('Lunes'), ('Martes'), ('Miércoles'), ('Jueves'), ('Viernes'), ('Sábado'), ('Domingo')
    ) as d(dia)
    cross join lateral (
      select jsonb_build_object(
        'desayuno', '2 Huevos revueltos, 1 rebanada de pan integral, café negro',
        'media', '1 Manzana verde y 10 almendras',
        'almuerzo', '150g Pechuga de pollo, 1/2 taza de arroz, ensalada verde',
        'merienda', '1 Yogur griego natural sin azúcar',
        'cena', '150g Pescado blanco al horno, vegetales al vapor'
      ) as comidas
    ) c
  );

-- Semana "sana" para María González sobre la plantilla Bienestar Integral
insert into planes ("pacienteId", nombre, "plantillaId", estado, fecha, "fechaFin", semana)
select
  (select id from pacientes where email = 'maria@demo.com'),
  'Bienestar Integral',
  (select id from plantillas where nombre = 'Bienestar Integral'),
  'Activo',
  now() - interval '10 days',
  null,
  (
    select jsonb_object_agg(dia, comidas)
    from (values
      ('Lunes'), ('Martes'), ('Miércoles'), ('Jueves'), ('Viernes'), ('Sábado'), ('Domingo')
    ) as d(dia)
    cross join lateral (
      select jsonb_build_object(
        'desayuno', 'Tostada integral con aguacate y huevo pochado',
        'media', 'Frutas mixtas con granola',
        'almuerzo', 'Ensalada mediterránea con pollo y quinoa',
        'merienda', 'Hummus con bastones de zanahoria',
        'cena', 'Salmón al horno con vegetales asados'
      ) as comidas
    ) c
  );

-- ── Cotizaciones ──
insert into cotizaciones ("pacienteId", "plantillaId", "planNombre", precio, fecha, "fechaExpiracion", estado) values
((select id from pacientes where email = 'carlos@demo.com'), (select id from plantillas where nombre = 'Déficit Sostenible'), 'Déficit Sostenible', 49.99, now() - interval '20 days', now() - interval '13 days', 'Pagada'),
((select id from pacientes where email = 'maria@demo.com'), (select id from plantillas where nombre = 'Bienestar Integral'), 'Bienestar Integral', 34.99, now() - interval '12 days', now() - interval '5 days', 'Pagada'),
((select id from pacientes where email = 'roberto@demo.com'), (select id from plantillas where nombre = 'Keto Avanzado'), 'Keto Avanzado', 59.99, now() - interval '5 days', now() + interval '2 days', 'Pendiente'),
((select id from pacientes where email = 'ana@demo.com'), (select id from plantillas where nombre = 'Masa Muscular Pro'), 'Masa Muscular Pro', 69.99, now() - interval '3 days', now() + interval '4 days', 'Pendiente');

-- ── Pagos ──
insert into pagos ("cotizacionId", "pacienteId", "planNombre", monto, metodo, "tarjetaUltimos4", referencia, estado, fecha) values
(
  (select id from cotizaciones where "planNombre" = 'Déficit Sostenible' and "pacienteId" = (select id from pacientes where email = 'carlos@demo.com')),
  (select id from pacientes where email = 'carlos@demo.com'),
  'Déficit Sostenible', 49.99, 'Tarjeta', '4242', 'GB-DEMO-A1B2', 'Pagado', now() - interval '18 days'
),
(
  (select id from cotizaciones where "planNombre" = 'Bienestar Integral' and "pacienteId" = (select id from pacientes where email = 'maria@demo.com')),
  (select id from pacientes where email = 'maria@demo.com'),
  'Bienestar Integral', 34.99, 'Tarjeta', '5544', 'GB-DEMO-C3D4', 'Pagado', now() - interval '10 days'
);

-- ── Notificaciones ──
insert into notificaciones (tipo, mensaje, "pacienteId", fecha, leida) values
('solicitud', 'Carlos Mendoza ha solicitado el plan "Déficit Sostenible".', null, now() - interval '25 days', true),
('plan_asignado', 'Se ha asignado el plan "Déficit Sostenible - Mes 1".', (select id from pacientes where email = 'carlos@demo.com'), now() - interval '15 days', true),
('pago_aprobado', 'Pago aprobado por $49.99 — Plan Déficit Sostenible.', (select id from pacientes where email = 'carlos@demo.com'), now() - interval '18 days', true),
('solicitud', 'Roberto López ha solicitado el plan "Keto Avanzado".', null, now() - interval '5 days', false),
('cotizacion_creada', 'Nueva cotización para "Masa Muscular Pro" por $69.99.', (select id from pacientes where email = 'ana@demo.com'), now() - interval '3 days', false);

-- ── Historial de peso ──
insert into peso_historial ("pacienteId", peso, fecha) values
((select id from pacientes where email = 'carlos@demo.com'), 88, now() - interval '60 days'),
((select id from pacientes where email = 'carlos@demo.com'), 86, now() - interval '45 days'),
((select id from pacientes where email = 'carlos@demo.com'), 84, now() - interval '30 days'),
((select id from pacientes where email = 'carlos@demo.com'), 83, now() - interval '15 days'),
((select id from pacientes where email = 'carlos@demo.com'), 82, now() - interval '1 days'),
((select id from pacientes where email = 'maria@demo.com'), 67, now() - interval '45 days'),
((select id from pacientes where email = 'maria@demo.com'), 66, now() - interval '30 days'),
((select id from pacientes where email = 'maria@demo.com'), 65, now() - interval '10 days');
