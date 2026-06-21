import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)

  // Garante que o usuário tenha perfil + organização (cria no primeiro login).
  const ensureWorkspace = useCallback(async (user) => {
    if (!user) return null

    // Já é membro de alguma organização?
    const { data: membership } = await supabase
      .from('org_members')
      .select('role, organizations(*)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (membership?.organizations) {
      return { ...membership.organizations, role: membership.role }
    }

    // Cria perfil (idempotente) e a organização padrão da SENA.
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email,
    })

    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({ name: 'SENA COMERCIAL', owner_id: user.id })
      .select()
      .single()

    if (newOrg) {
      await supabase
        .from('org_members')
        .insert({ org_id: newOrg.id, user_id: user.id, role: 'owner' })
      return { ...newOrg, role: 'owner' }
    }
    return null
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        ensureWorkspace(data.session.user).then(setOrg).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        ensureWorkspace(s.user).then(setOrg)
      } else {
        setOrg(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [ensureWorkspace])

  const value = {
    session,
    user: session?.user ?? null,
    org,
    loading,
    configured: isSupabaseConfigured,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, fullName) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
