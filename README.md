# ⚽ FutbolStats

**Tu aplicación personal para registrar partidos de fútbol y ver tus estadísticas**

## 🌟 Features

### 📊 Dashboard Completo
- **4 Cards de estadísticas** en layout 2x2 (optimizado para mobile)
- Partidos jugados, goles totales, asistencias, victorias
- Gráfico de barras: Goles y asistencias por mes
- Gráfico de pastel: Distribución de resultados (victorias/empates/derrotas)

### 🎯 Gestión de Partidos
- Registrar partidos con todos los detalles
- Fecha, tipo de partido, equipos, resultado
- Tus goles y asistencias personales
- Notas adicionales
- **Validaciones inteligentes**: No puedes meter más goles que el total del equipo

### 👥 Equipos y Torneos
- Crear y administrar equipos
- Crear y administrar torneos con fechas y descripciones
- Asignar partidos a torneos específicos

### 🔍 Filtros Avanzados
- **Por período**: 1 semana, 2 semanas, 1 mes, 3 meses, 6 meses, 1 año, todo
- **Por torneo**: Ver solo partidos de un torneo específico
- Los gráficos y stats se actualizan automáticamente

### 👤 Perfiles de Usuario
- Registro con email y contraseña (Supabase Auth)
- Perfil personalizable:
  - Foto de perfil (upload de imágenes)
  - Nombre completo
  - Bio
  - Cambio de contraseña
- Mensaje de bienvenida personalizado ("¡Buenos días, Juan!")

### 🔒 Seguridad y Privacidad
- **Row Level Security (RLS)**: Cada usuario solo ve sus datos
- Autenticación segura con JWT tokens
- Contraseñas encriptadas
- Los datos están 100% protegidos a nivel de base de datos

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19
- **Styling**: Tailwind CSS 4 + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Charts**: Recharts
- **Deploy**: Vercel

## 🚀 Deployment

Ver guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Start:**
1. Crear proyecto en Supabase
2. Ejecutar scripts SQL en orden
3. Configurar Storage para avatares
4. Deploy en Vercel
5. ¡Listo!

## 📱 Mobile First

La aplicación está completamente optimizada para mobile:
- Cards en grid 2x2
- Filtros compactos lado a lado
- Touch-friendly buttons
- Responsive en todos los tamaños

## 🎨 Diseño

- Modo oscuro por defecto
- Animaciones suaves
- Gráficos interactivos
- UI moderna y limpia con Shadcn/ui

## 📊 Scripts SQL

Todos en la carpeta `my-app/scripts/`:
1. `001_create_matches_table.sql` - Tabla de partidos
2. `002_fix_matches_schema.sql` - Agregar tipo 'entrenamiento'
3. `003_create_teams_table.sql` - Tabla de equipos
4. `005_add_user_authentication.sql` - Autenticación y RLS
5. `006_create_user_profiles.sql` - Perfiles de usuario

## 🔐 Autenticación

Usando **Supabase Auth**:
- Email/Password authentication
- Protección a nivel de base de datos (RLS)
- Cada usuario tiene sus datos privados
- Sesiones seguras con JWT

## 📝 Validaciones

- Goles propios ≤ Goles del equipo
- Asistencias máximas = Goles del equipo - Tus goles
- La suma de goles + asistencias ≤ Goles del equipo
- Validación en tiempo real con feedback visual

## 🎯 Roadmap (ideas futuras)

- [ ] Modo claro/oscuro toggle
- [ ] Exportar estadísticas a PDF
- [ ] Compartir resultados en redes sociales
- [ ] OAuth con Google/Facebook
- [ ] Estadísticas por posición en el campo
- [ ] Comparar stats con amigos
- [ ] Notificaciones por email
- [ ] App móvil nativa (React Native)

## 📄 Licencia

MIT

## 👨‍💻 Desarrollo

```bash
# Instalar dependencias
cd my-app
npm install

# Configurar variables de entorno
# Crear .env.local con:
# NEXT_PUBLIC_SUPABASE_URL=tu-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 🤝 Contribuir

PRs son bienvenidos! Para cambios grandes, abre un issue primero.

---

**Hecho con ⚽ y ❤️**

