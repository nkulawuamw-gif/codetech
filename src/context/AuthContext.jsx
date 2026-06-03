import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const loadProfile = useCallback(async (uid) => {
    if (!supabase || !uid) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', uid)
      .single()
    if (error) return null
    return data
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const u = data?.session?.user ?? null
      setUser(u)
      if (u) setProfile(await loadProfile(u.id))
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) setProfile(await loadProfile(u.id))
      else setProfile(null)
    })
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured. See README to set up your database.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data?.user) {
      const prof = await loadProfile(data.user.id)
      if (!prof || prof.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Your account is not authorised as an admin.')
      }
    }
    return data
  }, [loadProfile])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const isAdmin = Boolean(profile?.role === 'admin')

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signIn, signOut, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}
