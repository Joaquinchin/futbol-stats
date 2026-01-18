'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { User, Upload, Loader2, Camera } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/client'

export function UserProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
  })

  // Actualizar formData cuando cambie el profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  // Nombre a mostrar (prioriza el nombre del perfil)
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario'

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()

      // Primero verificar si el perfil existe
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        // Si no existe, crear el perfil
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            full_name: formData.full_name.trim() || null,
            bio: formData.bio.trim() || null,
          })
          .select()

        if (error) throw error
      } else {
        // Si existe, actualizar el perfil
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name.trim() || null,
            bio: formData.bio.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()

        if (error) throw error
      }

      await refreshProfile()
      
      setSuccess('¡Perfil actualizado!')
      
      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        setOpen(false)
        setSuccess(null)
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe ser menor a 2MB')
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    setUploadingAvatar(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Verificar si el perfil existe
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        // Si no existe, crear el perfil con el avatar
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            avatar_url: publicUrl,
          })

        if (insertError) throw insertError
      } else {
        // Si existe, actualizar el avatar
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id)

        if (updateError) throw updateError
      }

      await refreshProfile()
      setSuccess('¡Foto actualizada!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setChangingPassword(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setSuccess('¡Contraseña actualizada!')
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user?.email || 'U')}&background=random`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div className="relative">
            <img
              src={getAvatarUrl()}
              alt="Avatar"
              className="h-6 w-6 rounded-full object-cover"
            />
          </div>
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mi Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover border-4 border-primary/10"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            {uploadingAvatar && <Loader2 className="h-4 w-4 animate-spin" />}
            <p className="text-xs text-muted-foreground">
              Haz clic en la cámara para cambiar tu foto (max 2MB)
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-primary bg-primary/10 p-3 rounded">
              {success}
            </div>
          )}

          {/* Datos del perfil */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El email no se puede cambiar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre completo</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (opcional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Cuéntanos sobre ti..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </form>

          {/* Cambiar contraseña */}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cambiar Contraseña</CardTitle>
                <CardDescription>Ingresa tu nueva contraseña</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    disabled={changingPassword}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    disabled={changingPassword}
                    minLength={6}
                  />
                </div>

                <Button type="submit" disabled={changingPassword || !passwordData.newPassword} className="w-full" variant="outline">
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

