import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { AuthContext, type Profile } from './auth';

interface AuthProviderProps {
  children: ReactNode;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('nombre_visible, avatar_ruta, zona_id, creado_en')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }
  return data;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    setProfile(await fetchProfile(userId));
    setProfileLoading(false);
  }, []);

  // Sesion y perfil se resuelven juntos aca, se comparten via
  // contexto, y useOwnProfile los expone al resto de la app.
  const applySession = useCallback(
    (nextSession: Session | null) => {
      setSession(nextSession);
      setLoading(false);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    },
    [loadProfile]
  );

  const refetchProfile = useCallback(async () => {
    if (!session?.user) return;
    await loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    // Leer sesión existente (cuando la app carga o recarga)
    supabase.auth.getSession()
      .then(({ data: { session } }) => applySession(session))
      .catch((error) => {
        console.error('Error al obtener sesión:', error);
        setLoading(false);
        setProfileLoading(false);
      });

    // Suscribirse a cambios de autenticación (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => applySession(session)
    );

    return () => subscription?.unsubscribe();
  }, [applySession]);

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user || null, loading, profile, profileLoading, refetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
