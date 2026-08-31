-- ============================================================
-- GreenBite — Esquema de Base de Datos (Supabase / PostgreSQL)
-- ============================================================
-- Cómo usar este archivo:
-- 1. Entra a tu proyecto en supabase.com
-- 2. Ve a "SQL Editor" (menú lateral) > "New query"
-- 3. Pega TODO el contenido de este archivo y presiona "Run"
-- 4. Luego haz lo mismo con 02_seed.sql (opcional, datos de prueba)
--
-- Los nombres de columna van entre comillas dobles ("pacienteId",
-- "fechaRegistro", etc.) porque el código de la app (src/lib/storage.js)
-- ya usa esos nombres en camelCase. Postgres normalmente vuelve todo
-- minúsculas si no usas comillas, así que hay que mantenerlas
-- exactamente así al hacer cualquier cambio futuro al esquema.
-- ============================================================

create extension if not exists pgcrypto;

-- ── PACIENTES ──
create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password text not null,
  edad int default 0,
  sexo text default 'M',
  peso numeric default 0,
  altura numeric default 0,
  objetivo text default 'sana',
  "nivelActividad" text default 'moderado',
  estado text default 'Activo',
  "mustChangePassword" boolean default false,
  rol text default 'paciente',
  "fechaRegistro" timestamptz default now()
);

-- ── PLANTILLAS ──
create table if not exists plantillas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  objetivo text,
  "desc" text,
  prot numeric default 0,
  carb numeric default 0,
  gras numeric default 0,
  calorias numeric default 2000,
  duracion int default 30,
  precio numeric default 0,
  estado text default 'activo'
);

-- ── PLANES (dietas asignadas a pacientes) ──
create table if not exists planes (
  id uuid primary key default gen_random_uuid(),
  "pacienteId" uuid not null references pacientes(id) on delete cascade,
  nombre text default 'Plan Personalizado',
  "plantillaId" uuid references plantillas(id) on delete set null,
  estado text default 'Activo',
  fecha timestamptz default now(),
  "fechaFin" timestamptz,
  semana jsonb default '{}'::jsonb
);

-- ── COTIZACIONES ──
create table if not exists cotizaciones (
  id uuid primary key default gen_random_uuid(),
  "pacienteId" uuid not null references pacientes(id) on delete cascade,
  "plantillaId" uuid references plantillas(id) on delete set null,
  "planNombre" text,
  precio numeric default 0,
  fecha timestamptz default now(),
  "fechaExpiracion" timestamptz,
  estado text default 'Pendiente'
);

-- ── PAGOS ──
create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  "cotizacionId" uuid references cotizaciones(id) on delete set null,
  "pacienteId" uuid not null references pacientes(id) on delete cascade,
  "planNombre" text,
  monto numeric default 0,
  metodo text default 'Tarjeta',
  "tarjetaUltimos4" text,
  referencia text,
  estado text default 'Pendiente',
  fecha timestamptz default now()
);

-- ── NOTIFICACIONES ──
create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  tipo text default 'general',
  mensaje text,
  "pacienteId" uuid references pacientes(id) on delete cascade,
  leida boolean default false,
  fecha timestamptz default now()
);

-- ── CUMPLIMIENTO (comidas marcadas como completadas) ──
create table if not exists cumplimiento (
  id uuid primary key default gen_random_uuid(),
  "pacienteId" uuid not null references pacientes(id) on delete cascade,
  dia text not null,
  "comidaId" text not null,
  completado boolean default false,
  unique ("pacienteId", dia, "comidaId")
);

-- ── HISTORIAL DE PESO ──
create table if not exists peso_historial (
  id uuid primary key default gen_random_uuid(),
  "pacienteId" uuid not null references pacientes(id) on delete cascade,
  peso numeric not null,
  fecha timestamptz default now()
);

-- ============================================================
-- Índices útiles
-- ============================================================
create index if not exists idx_planes_paciente on planes ("pacienteId");
create index if not exists idx_cotizaciones_paciente on cotizaciones ("pacienteId");
create index if not exists idx_pagos_paciente on pagos ("pacienteId");
create index if not exists idx_notificaciones_paciente on notificaciones ("pacienteId");
create index if not exists idx_cumplimiento_paciente on cumplimiento ("pacienteId");
create index if not exists idx_peso_paciente on peso_historial ("pacienteId");

-- ============================================================
-- Row Level Security
-- ============================================================
-- IMPORTANTE — LÉEME:
-- Esta app NO usa Supabase Auth: el login es manejado por tu propio
-- código (AuthContext.jsx) comparando email/password guardados en la
-- tabla "pacientes". Eso significa que, desde el punto de vista de
-- Supabase, TODAS las peticiones llegan con el mismo rol "anon"
-- (la clave pública que ya está en supabase.js), sin importar si el
-- que pregunta es el administrador o un paciente cualquiera.
--
-- Las políticas de abajo son PERMISIVAS A PROPÓSITO (permiten leer y
-- escribir todo con la clave anon) para que la app funcione tal cual
-- está hoy. Esto es aceptable para un proyecto académico/prototipo,
-- pero implica que:
--   • Cualquiera con tu Project URL + anon key puede leer/editar/borrar
--     cualquier fila de estas tablas (incluyendo contraseñas en texto
--     plano en "pacientes").
--   • No hay separación real entre "lo que puede ver el admin" y
--     "lo que puede ver un paciente" a nivel de base de datos.
-- Si esto llega a producción real, lo correcto es migrar el login a
-- Supabase Auth y escribir políticas RLS por usuario (auth.uid()).
-- ============================================================

alter table pacientes enable row level security;
alter table plantillas enable row level security;
alter table planes enable row level security;
alter table cotizaciones enable row level security;
alter table pagos enable row level security;
alter table notificaciones enable row level security;
alter table cumplimiento enable row level security;
alter table peso_historial enable row level security;

drop policy if exists "allow all pacientes" on pacientes;
create policy "allow all pacientes" on pacientes for all using (true) with check (true);

drop policy if exists "allow all plantillas" on plantillas;
create policy "allow all plantillas" on plantillas for all using (true) with check (true);

drop policy if exists "allow all planes" on planes;
create policy "allow all planes" on planes for all using (true) with check (true);

drop policy if exists "allow all cotizaciones" on cotizaciones;
create policy "allow all cotizaciones" on cotizaciones for all using (true) with check (true);

drop policy if exists "allow all pagos" on pagos;
create policy "allow all pagos" on pagos for all using (true) with check (true);

drop policy if exists "allow all notificaciones" on notificaciones;
create policy "allow all notificaciones" on notificaciones for all using (true) with check (true);

drop policy if exists "allow all cumplimiento" on cumplimiento;
create policy "allow all cumplimiento" on cumplimiento for all using (true) with check (true);

drop policy if exists "allow all peso_historial" on peso_historial;
create policy "allow all peso_historial" on peso_historial for all using (true) with check (true);
