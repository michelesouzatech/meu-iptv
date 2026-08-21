/* ============================================================
   Meu IPTV — conexão com o banco de dados de verdade (Supabase)
   Fase 6. Se um dia precisar trocar de projeto, muda só aqui.
   ============================================================ */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://krgcsqfdyncnsgjtwaha.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZ2NzcWZkeW5jbnNnanR3YWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyODgxMjMsImV4cCI6MjEwMjg2NDEyM30.SA1edKidYKq9iCLoZa4FFR3BXO9a7xH-_esIZAmYEoY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
