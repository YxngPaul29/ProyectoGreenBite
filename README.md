# 🥗 GreenBite

Plataforma web para que una nutricionista gestione pacientes, planes alimenticios y cobros, y para que los pacientes vean su dieta asignada, marquen su cumplimiento diario y paguen sus planes.

Construido con **React + Vite** en el frontend y **Supabase (PostgreSQL)** como base de datos.

---

## ✨ Funcionalidades

**Panel de administrador (nutricionista)**
- Gestión de pacientes (crear, editar, dar de baja)
- Catálogo de plantillas de planes alimenticios con macros (proteína/carbohidratos/grasas) y precio
- Asignación de planes semanales personalizados a cada paciente
- Gestión de cotizaciones y pagos
- Dashboard con estadísticas: pacientes totales, planes activos, ingresos, solicitudes pendientes

**Panel de paciente**
- Ver su plan de alimentación asignado, día por día
- Marcar comidas como completadas y ver su % de cumplimiento diario/semanal
- Calculadora de IMC a partir de peso y altura
- Historial de peso con gráfica
- Explorar el catálogo público de planes y solicitar uno (genera una cotización)
- Pagar planes (simulado) y ver historial de pagos con recibo descargable en PDF
- Notificaciones (plan asignado, pago aprobado, etc.)

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Enrutamiento | React Router 6 |
| Base de datos | PostgreSQL (vía [Supabase](https://supabase.com)) |
| Gráficas | Recharts |
| PDFs | jsPDF |

---

## 🚀 Empezar en local

### 1. Requisitos
- Node.js 18+
- Una cuenta gratuita en [supabase.com](https://supabase.com)

### 2. Clonar e instalar
```bash
git clone https://github.com/<tu-usuario>/ProyectoGreenBite.git
cd ProyectoGreenBite
npm install
```

### 3. Configurar la base de datos
1. Crea un proyecto nuevo en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** → *New query*, pega y ejecuta `supabase/01_schema.sql` (crea todas las tablas).
3. *(Opcional, para tener datos de prueba)* Ejecuta también `supabase/02_seed.sql`.
4. Ve a **Settings → API** y copia tu **Project URL** y tu **anon/public key**.
5. Pega esos dos valores en `src/lib/supabase.js`:
   ```js
   const supabaseUrl = 'TU_PROJECT_URL';
   const supabaseKey = 'TU_ANON_KEY';
   ```

### 4. Correr la app
```bash
npm run dev
```
Abre `http://localhost:5173`.

---

## 🔑 Credenciales de acceso

**Administrador** (hardcodeado en el código, no requiere base de datos):
- Email: `admin@greenbite.com`
- Contraseña: `admin123`

**Pacientes de prueba** (solo si ejecutaste `02_seed.sql`, contraseña de todos: `demo1234`):
- `carlos@demo.com`
- `maria@demo.com`
- `roberto@demo.com`
- `ana@demo.com`

O regístrate como paciente nuevo directamente desde la app.

---

## 📁 Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (modales, sidebar, topbar, etc.)
├── lib/
│   ├── supabase.js     # Cliente de Supabase
│   ├── storage.js      # Toda la lógica de acceso a datos (CRUD sobre Supabase)
│   ├── AuthContext.jsx # Autenticación y sesión (admin + pacientes)
│   └── payments.js     # Simulación de procesamiento de pagos
├── pages/
│   ├── admin/         # Vistas del panel de administrador
│   └── paciente/       # Vistas del panel de paciente
└── App.jsx            # Rutas de la aplicación

supabase/
├── 01_schema.sql       # Esquema de la base de datos (tablas, índices, RLS)
└── 02_seed.sql          # Datos de prueba opcionales
```

---

## 🌐 Desplegar en producción

Es una app estática (Vite build) que se conecta directo a Supabase, así que funciona en cualquier hosting de sitios estáticos:

- **[Vercel](https://vercel.com)** o **[Netlify](https://netlify.com)**: conecta el repo de GitHub y despliega — detectan Vite automáticamente.
- Comando de build: `npm run build` → genera la carpeta `dist/`.

⚠️ Asegúrate de que `node_modules` **no** esté en tu repositorio (debe estar en `.gitignore`); si Vercel/Netlify lo encuentra ahí, el build falla.

---

## ⚠️ Notas de seguridad (proyecto académico / prototipo)

Este proyecto **no usa Supabase Auth** — el login es manejado por código propio comparando email/contraseña guardados en la tabla `pacientes`. Por simplicidad:

- Las contraseñas se guardan **en texto plano** (no hasheadas).
- Las políticas de Row Level Security (RLS) en Supabase son **permisivas**: cualquiera con la `anon key` pública puede leer/escribir todas las tablas.

Esto es aceptable para un proyecto de curso o demo, pero **no es apto para producción real** con datos de usuarios verdaderos. Antes de eso habría que migrar a Supabase Auth, hashear contraseñas y escribir políticas RLS por usuario.

---

## 📄 Licencia

Proyecto académico / de práctica. Uso libre para fines educativos.
