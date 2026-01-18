'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        // Incluso con error, intentar crear el perfil
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({ id: userId })
          .select()
          .maybeSingle()
        
        if (!insertError && newProfile) {
          setProfile(newProfile)
        }
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Crear perfil automáticamente si no existe
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({ id: userId })
          .select()
          .maybeSingle()
        
        if (!insertError && newProfile) {
          setProfile(newProfile)
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Cargar perfil en segundo plano (no bloquea)
      if (session?.user) {
        loadProfile(session.user.id)
      }
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Cargar perfil en segundo plano
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

