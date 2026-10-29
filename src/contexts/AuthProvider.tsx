import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [enRecuperacion, setEnRecuperacion] = useState(false);
  const [sesionVencida, setSesionVencida] = useState(false);
  // Marca que el SIGNED_OUT que viene lo pidió el usuario: sin ella, es una
  // sesión que se perdió sola.
  const cierreVoluntario = useRef(false);

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

  const cerrarSesion = useCallback(async (alcance: 'local' | 'global') => {
    cierreVoluntario.current = true;
    const { error } = await supabase.auth.signOut({ scope: alcance });
    // El SIGNED_OUT ya limpió la marca; si signOut falló antes de emitirlo no
    // puede quedar encendida, o el próximo cierre involuntario saldría sin aviso.
    cierreVoluntario.current = false;
    if (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    // Leer sesión existente (cuando la app carga o recarga)
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        applySession(session);
      })
      .catch((error) => {
        console.error('Error al obtener sesión:', error);
        setLoading(false);
        setProfileLoading(false);
      });

    // Suscribirse a cambios de autenticación (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // El link del correo llega con una sesión de recuperación: sólo con ella
        // se puede elegir la contraseña nueva. USER_UPDATED llega cuando
        // updateUser terminó bien.
        if (event === 'PASSWORD_RECOVERY') setEnRecuperacion(true);
        if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') setEnRecuperacion(false);
        // Un SIGNED_OUT que el usuario no pidió es una sesión vencida. Al abrir
        // la app sin sesión no llega SIGNED_OUT, así que ahí no hay aviso.
        if (event === 'SIGNED_OUT') {
          setSesionVencida(!cierreVoluntario.current);
          cierreVoluntario.current = false;
        }
        if (event === 'SIGNED_IN') setSesionVencida(false);
        applySession(session);
      }
    );

    return () => subscription?.unsubscribe();
  }, [applySession]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        loading,
        profile,
        profileLoading,
        refetchProfile,
        enRecuperacion,
        sesionVencida,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
