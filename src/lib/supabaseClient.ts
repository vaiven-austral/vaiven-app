import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY, createClient tira una
// excepción en el import y deja toda la app en blanco. Con un fallback la
// app carga igual; lo que falla es cada llamada a Supabase (login, feed,
// etc.), ya con su propio manejo de error en cada pantalla.
// .invalid es un TLD reservado por la RFC 2606 que nunca resuelve a nada
// real, a diferencia de un subdominio bajo supabase.co que en teoría
// alguien podría llegar a controlar.
export const supabase = createClient(
  supabaseUrl || 'https://missing-supabase-configuration.invalid',
  supabaseAnonKey || 'missing-supabase-anon-key'
);