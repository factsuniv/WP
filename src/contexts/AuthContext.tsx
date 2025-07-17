import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getCurrentUser, Profile, getUserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount (one-time check)
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          const userProfile = await getUserProfile(currentUser.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // Set up auth listener - KEEP SIMPLE, avoid any async operations in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // NEVER use any async operations in callback - using setTimeout with 0 delay
        setTimeout(async () => {
          if (session?.user) {
            setUser(session.user)
            try {
              const userProfile = await getUserProfile(session.user.id)
              setProfile(userProfile)
            } catch (error) {
              console.error('Error loading profile:', error)
            }
          } else {
            setUser(null)
            setProfile(null)
          }
        }, 0)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Auth methods
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      // Use enhanced signup function to handle email validation issues
      const { data, error } = await supabase.functions.invoke('enhanced-signup', {
        body: {
          email,
          password,
          fullName
        }
      })

      if (error) {
        throw new Error(error.message || 'Signup failed')
      }

      if (!data.success) {
        throw new Error(data.error || 'Signup failed')
      }

      // Profile creation is handled by the edge function
      return {
        user: data.data.user,
        session: null,
        method: data.method
      }
    } catch (error: any) {
      console.error('Error signing up:', error.message)
      throw error
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isAdmin = profile?.role === 'admin'

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
