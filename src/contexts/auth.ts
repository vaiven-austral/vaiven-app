import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

// Las 4 columnas de perfiles que necesita la app (H3-4.1); no incluye
// rol_preferido ni el resto del esquema, que hoy ninguna pantalla usa.
export interface Profile {
  nombre_visible: string;
  avatar_ruta: string | null;
  zona_id: number | null;
  creado_en: string;
}

export interface AuthContextType {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  refetchProfile: () => Promise<void>;
  // true desde que se abre el link de recuperación (PASSWORD_RECOVERY) hasta
  // que se cambia la contraseña (USER_UPDATED) o se cierra la sesión.
  enRecuperacion: boolean;
  // true cuando la sesión se perdió sin que el usuario la cerrara (venció el
  // token, o se cerró desde otro dispositivo). Vuelve a false al iniciar sesión.
  sesionVencida: boolean;
  // El único lugar de la app que llama a supabase.auth.signOut. 'local' cierra
  // sólo este dispositivo; 'global', todos los del usuario. Devuelve false si
  // Supabase no confirmó el cierre: este dispositivo sale igual, pero en el
  // global los otros siguen adentro.
  cerrarSesion: (alcance: 'local' | 'global') => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
