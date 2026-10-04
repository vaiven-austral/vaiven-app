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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
