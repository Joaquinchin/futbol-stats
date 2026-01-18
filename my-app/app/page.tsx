'use client'

import { Dashboard } from '@/components/dashboard'
import { AuthScreen } from '@/components/auth-screen'
import { UserProfile } from '@/components/user-profile'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

export default function Home() {
  const { user, profile, loading, signOut } = useAuth()

  // Mostrar loading mientras verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si no hay usuario, mostrar pantalla de login
  if (!user) {
    return <AuthScreen />
  }

  // Si hay usuario, mostrar el dashboard
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 19) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl">
        {/* Header con perfil y logout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">
              {getGreeting()}, {displayName}!
            </h2>
            <p className="text-sm text-muted-foreground">
              Aquí están tus estadísticas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UserProfile />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Dashboard />
      </div>
    </main>
  )
}
