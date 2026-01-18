# 🚀 Guía de Deployment - FutbolStats

Esta guía te llevará paso a paso desde cero hasta tener tu aplicación en producción.

## 📋 Índice
1. [Configurar Supabase](#1-configurar-supabase)
2. [Limpiar y configurar la Base de Datos](#2-limpiar-y-configurar-la-base-de-datos)
3. [Configurar Supabase Storage](#3-configurar-supabase-storage)
4. [Configurar Autenticación](#4-configurar-autenticación)
5. [Deploy en Vercel](#5-deploy-en-vercel)
6. [Probar la aplicación](#6-probar-la-aplicación)

---

## 1. Configurar Supabase

### 1.1 Crear proyecto (si no lo tienes)
1. Ve a https://app.supabase.com
2. Click en "New Project"
3. Completa:
   - **Name**: `futbolstats` (o el que prefieras)
   - **Database Password**: Guárdala en un lugar seguro
   - **Region**: South America (Brasil) - más cercano
4. Espera 2-3 minutos a que se cree

### 1.2 Obtener credenciales
1. Ve a **Settings** (engranaje) → **API**
2. Copia y guarda:
   - ✅ **Project URL**: `https://xxxxx.supabase.co`
   - ✅ **anon public key**: `eyJhbGciOiJIUzI1NiIsI...` (clave larga)

---

## 2. Limpiar y configurar la Base de Datos

### 2.1 Limpiar datos existentes (si hay)
En Supabase, ve a **SQL Editor** y ejecuta:

```sql
-- CUIDADO: Esto borra TODOS los datos existentes
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

### 2.2 Ejecutar scripts en orden
En **SQL Editor**, ejecuta estos scripts **UNO POR UNO** en orden:

#### Script 1: Crear tabla matches
```sql
-- Copiar y pegar todo el contenido de:
my-app/scripts/001_create_matches_table.sql
```

#### Script 2: Fix matches schema
```sql
-- Copiar y pegar todo el contenido de:
my-app/scripts/002_fix_matches_schema.sql
```

#### Script 3: Crear tabla teams
```sql
-- Copiar y pegar todo el contenido de:
my-app/scripts/003_create_teams_table.sql
```

#### Script 4: Crear tabla tournaments (NO EXISTE - omitir por ahora)
La tabla de torneos se crea en el script de autenticación.

#### Script 5: **Agregar autenticación**
```sql
-- ⚠️ IMPORTANTE: Este script crea las tablas tournaments Y user_profiles
-- Copiar y pegar todo el contenido de:
my-app/scripts/005_add_user_authentication.sql
```

#### Script 6: **Crear perfiles de usuario**
```sql
-- Copiar y pegar todo el contenido de:
my-app/scripts/006_create_user_profiles.sql
```

### 2.3 Verificar que todo se creó
Ve a **Table Editor** y verifica que existan estas tablas:
- ✅ `matches`
- ✅ `teams`
- ✅ `tournaments`
- ✅ `user_profiles`

---

## 3. Configurar Supabase Storage

### 3.1 Crear bucket para avatares
1. Ve a **Storage** en Supabase
2. Click en "New Bucket"
3. Configurar:
   - **Name**: `avatars`
   - **Public bucket**: ✅ ON (para que las fotos sean públicas)
4. Click "Create bucket"

### 3.2 Configurar políticas de Storage
Ve a **SQL Editor** y ejecuta:

```sql
-- Usuarios pueden subir su propio avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuarios pueden actualizar su propio avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuarios pueden eliminar su propio avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Todos pueden ver los avatares
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

---

## 4. Configurar Autenticación

### 4.1 Habilitar Email Auth
1. Ve a **Authentication** → **Providers**
2. Busca "Email" y asegúrate que esté habilitado
3. Configuración recomendada:
   - **Enable email confirmations**: ❌ OFF (para desarrollo)
     - Si lo dejas ON, los usuarios deben confirmar su email antes de usar la app
   - **Enable email change confirmation**: ❌ OFF
   - **Enable phone confirmations**: ❌ OFF

### 4.2 Configurar URLs (importante para producción)
Ve a **Authentication** → **URL Configuration**:
- **Site URL**: `https://tu-app.vercel.app` (después de deployar)
- **Redirect URLs**: `https://tu-app.vercel.app/**`

---

## 5. Deploy en Vercel

### 5.1 Preparar el proyecto
1. Asegúrate de estar en la carpeta del proyecto:
```bash
cd my-app
```

2. Verifica que el archivo `.env.local` NO esté en git:
```bash
# Debe estar en .gitignore
cat .gitignore | grep .env.local
```

### 5.2 Subir a GitHub
```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "Initial commit - FutbolStats"

# Crear repo en GitHub y conectar
# Ve a https://github.com/new
# Luego:
git remote add origin https://github.com/tu-usuario/futbolstats.git
git branch -M main
git push -u origin main
```

### 5.3 Deploy en Vercel
1. Ve a https://vercel.com
2. Click en "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Configurar:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `my-app`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

5. **Agregar variables de entorno**:
   Click en "Environment Variables" y agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`: tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: tu anon key

6. Click en "Deploy"
7. Espera 2-3 minutos

### 5.4 Obtener URL de producción
Después del deploy, Vercel te dará una URL como:
- `https://futbolstats.vercel.app`
- `https://futbolstats-xxx.vercel.app`

---

## 6. Probar la aplicación

### 6.1 Registro de usuarios
1. Abre tu app: `https://tu-app.vercel.app`
2. Click en "¿No tienes cuenta? Regístrate"
3. Ingresa:
   - Nombre completo: `Tu Nombre`
   - Email: `test@example.com`
   - Contraseña: `123456` (o la que prefieras)
4. Click en "Crear Cuenta"

### 6.2 Probar funcionalidades
1. ✅ **Perfil**: Click en tu avatar → editar nombre, bio, foto
2. ✅ **Equipos**: Click en "Equipos" → agregar equipos
3. ✅ **Torneos**: Click en "Torneos" → agregar torneos
4. ✅ **Partidos**: Click en "Agregar Partido" → registrar un partido
5. ✅ **Filtros**: Probar filtros de fecha y torneo
6. ✅ **Gráficos**: Verificar que se actualicen

### 6.3 Probar con otro usuario
1. Cierra sesión (Click en el botón de salida)
2. Registra otro usuario: `test2@example.com`
3. Verifica que:
   - ✅ No vea los datos del primer usuario
   - ✅ Pueda crear sus propios partidos/equipos/torneos
   - ✅ Los datos estén separados

---

## 7. Configuración adicional (opcional)

### 7.1 Dominio personalizado
1. En Vercel, ve a tu proyecto → Settings → Domains
2. Agrega tu dominio: `miaplicacion.com`
3. Sigue las instrucciones para configurar DNS

### 7.2 Email provider (para producción)
Por defecto, Supabase usa su propio servicio de email (limitado).
Para producción, configura SendGrid, AWS SES, etc:
1. Ve a **Authentication** → **Email Templates**
2. Personaliza los emails de confirmación, reset password, etc.

---

## 🔧 Troubleshooting

### Error: "Cannot read properties of undefined"
- ✅ Limpia el caché: `npm run dev` → Ctrl+C → borrar `.next/` → `npm run dev`
- ✅ Verifica que las variables de entorno estén configuradas

### Error 401 Unauthorized
- ✅ Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea correcta
- ✅ Verifica que las políticas RLS estén creadas

### No puedo subir fotos
- ✅ Verifica que el bucket `avatars` exista
- ✅ Verifica que sea público
- ✅ Verifica las políticas de Storage

### Los datos no se ven
- ✅ Verifica que hayas ejecutado TODOS los scripts SQL
- ✅ Verifica las políticas RLS en cada tabla
- ✅ Revisa la consola del navegador (F12) para errores

---

## 📊 Verificación final

Checklist antes de compartir con amigos:

- ✅ Base de datos limpia y configurada
- ✅ Todas las tablas creadas (matches, teams, tournaments, user_profiles)
- ✅ Storage configurado (bucket avatars)
- ✅ Autenticación funcionando (Email Auth habilitado)
- ✅ App deployada en Vercel
- ✅ Variables de entorno configuradas en Vercel
- ✅ Probado con 2+ usuarios diferentes
- ✅ Datos separados por usuario
- ✅ Perfil de usuario funcionando
- ✅ Upload de fotos funcionando
- ✅ Cambio de contraseña funcionando

---

## 🎉 ¡Listo!

Tu aplicación está lista para compartir. Envía el link a tus amigos:
`https://tu-app.vercel.app`

Cada uno puede:
- Registrarse con su email
- Crear su perfil
- Registrar sus partidos
- Ver sus estadísticas
- Todo privado y seguro

---

## 📧 Soporte

Si algo no funciona, revisa:
1. Logs de Vercel (en el dashboard de Vercel)
2. Logs de Supabase (en SQL Editor → Logs)
3. Consola del navegador (F12 → Console)

