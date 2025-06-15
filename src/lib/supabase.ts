
import { createClient } from '@supabase/supabase-js'

// Temporary workaround: Hardcoding keys to get the app running.
// This is not a secure practice for production apps.
const supabaseUrl = 'https://yhokmsqcsbrfxjmldpjm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob2ttc3Fjc2JyZnhqbWxkcGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTk5NzYsImV4cCI6MjA2NTU5NTk3Nn0.PE5JhvN00VIVVUAhlQYK1-l_LenxSI5OuqckyN4k1bg'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
