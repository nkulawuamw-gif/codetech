// Supabase client wrapper
// If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env,
// the app will fetch content from PostgreSQL. Otherwise it falls
// back to the local data file (src/data/content.js).

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: window.localStorage,
      },
    })
  : null

export default supabase
