import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // Aviso amigável em dev quando o .env.local ainda não foi preenchido.
  console.warn(
    '[SENA Gestão] Supabase não configurado. Crie um .env.local com ' +
      'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
