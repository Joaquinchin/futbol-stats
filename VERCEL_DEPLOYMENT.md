# 🚀 Deployment en Vercel - FutbolStats

Guía paso a paso para deployar tu aplicación en Vercel.

---

## 📋 Pre-requisitos

Antes de deployar, asegúrate de que:

✅ Tu aplicación funciona correctamente en local (`npm run dev`)
✅ Tienes una cuenta en Supabase y la base de datos configurada
✅ Tienes las siguientes credenciales de Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎯 Paso 1: Subir tu código a GitHub

### 1.1 Crear un repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Haz clic en **"New repository"** (botón verde)
3. Nombra tu repositorio (ej: `futbol-stats`)
4. Deja las demás opciones por defecto
5. Haz clic en **"Create repository"**

### 1.2 Subir tu código

Abre la terminal en tu proyecto y ejecuta:

```bash
# Si ya tienes git inicializado, salta al paso de agregar el remote
# Si no, inicializa git:
git init

# Agrega todos los archivos
git add .

# Haz el primer commit
git commit -m "Initial commit - FutbolStats app"

# Conecta con tu repositorio de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git

# Sube el código
git branch -M main
git push -u origin main
```

---

## 🔵 Paso 2: Conectar con Vercel

### 2.1 Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"**
4. Autoriza Vercel para acceder a tu GitHub

### 2.2 Importar tu proyecto

1. En el dashboard de Vercel, haz clic en **"Add New"** → **"Project"**
2. Busca tu repositorio `futbol-stats` (o como lo hayas nombrado)
3. Haz clic en **"Import"**

### 2.3 Configurar el proyecto

En la página de configuración:

1. **Framework Preset**: Next.js (se detecta automáticamente)
2. **Root Directory**: `my-app` ⚠️ **MUY IMPORTANTE**
3. **Build Command**: `npm run build` (por defecto)
4. **Output Directory**: `.next` (por defecto)

---

## 🔑 Paso 3: Configurar Variables de Entorno

Antes de hacer deploy, debes agregar las variables de entorno:

1. En la página de configuración de Vercel, busca la sección **"Environment Variables"**
2. Agrega las siguientes variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase (ej: `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key de Supabase |

### ¿Dónde encontrar estas credenciales?

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. Haz clic en **"Settings"** → **"API"**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🚀 Paso 4: Deploy

1. Haz clic en **"Deploy"**
2. Espera de 2-5 minutos mientras Vercel:
   - Instala las dependencias
   - Construye tu aplicación
   - La despliega en producción

3. Una vez completado, verás:
   - ✅ **Deployment Complete**
   - Un enlace a tu aplicación (ej: `https://futbol-stats.vercel.app`)

---

## 🔧 Configuración adicional en Supabase

### 4.1 Agregar URL de Vercel a Supabase

Para que el authentication funcione correctamente:

1. Ve a tu proyecto en Supabase
2. **Settings** → **Authentication** → **URL Configuration**
3. Agrega tu URL de Vercel a **Site URL**:
   ```
   https://tu-app.vercel.app
   ```
4. Agrega tu URL a **Redirect URLs**:
   ```
   https://tu-app.vercel.app/**
   ```

### 4.2 Configurar Email Templates (opcional)

Si quieres personalizar los emails de confirmación:

1. **Authentication** → **Email Templates**
2. Personaliza los templates para:
   - Confirm signup
   - Reset password
   - Magic link

---

## 🧪 Paso 5: Probar tu aplicación

1. Abre tu URL de Vercel (ej: `https://futbol-stats.vercel.app`)
2. Prueba:
   - ✅ Registro de usuario
   - ✅ Login
   - ✅ Agregar equipos
   - ✅ Agregar torneos
   - ✅ Agregar partidos
   - ✅ Ver estadísticas
   - ✅ Actualizar perfil

---

## 🔄 Actualizaciones futuras

Cada vez que hagas cambios en tu código:

```bash
# Agrega los cambios
git add .

# Haz commit
git commit -m "Descripción de los cambios"

# Sube a GitHub
git push
```

**Vercel automáticamente detectará los cambios y re-desplegará tu app.** 🎉

---

## ⚠️ Troubleshooting

### Error: "Module not found"

**Solución**: Verifica que el **Root Directory** en Vercel esté configurado como `my-app`.

### Error: "Invalid API Key"

**Solución**: 
1. Verifica que las variables de entorno en Vercel sean correctas
2. Asegúrate de que no tengan espacios al inicio o final
3. Re-deploya haciendo clic en **"Redeploy"**

### Error: "Unauthorized" al registrarse

**Solución**: 
1. Ve a Supabase → **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Verifica que la URL de Vercel esté en **Redirect URLs**

### La app no se actualiza después de hacer push

**Solución**: 
1. Ve a Vercel → Tu proyecto → **Deployments**
2. Verifica que el último deployment haya sido exitoso
3. Si falló, revisa los logs haciendo clic en el deployment

---

## 📱 Dominio personalizado (opcional)

Si quieres usar tu propio dominio:

1. En Vercel, ve a **Settings** → **Domains**
2. Haz clic en **"Add"**
3. Ingresa tu dominio (ej: `futbolstats.com`)
4. Sigue las instrucciones para configurar los DNS

---

## 🎉 ¡Listo!

Tu aplicación ahora está live en internet. Comparte el link con tus amigos para que prueben:

```
https://tu-app.vercel.app
```

---

## 📚 Recursos útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Deployment Guide de Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

**¿Problemas?** Revisa los logs en Vercel o en la consola del navegador para más detalles.

