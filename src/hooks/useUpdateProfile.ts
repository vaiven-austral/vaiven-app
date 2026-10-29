import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useOwnProfile } from './useOwnProfile';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../contexts/auth';

type ProfileChanges = Partial<
  Pick<Profile, 'nombre_visible' | 'avatar_ruta' | 'zona_id' | 'categorias_interes'>
>;

// Guarda solo los campos que cambiaron (los decide quien llama), filtrado
// por el id del usuario de la sesión. Si Supabase devuelve error, se
// devuelve el mensaje y no se toca el perfil compartido. Si sale bien, se
// llama a refetch() de useOwnProfile para que la vista y la cabecera se
// actualicen sin recargar.
export function useUpdateProfile() {
  const { user } = useAuth();
  const { refetch } = useOwnProfile();
  const [saving, setSaving] = useState(false);

  const updateProfile = useCallback(
    async (changes: ProfileChanges): Promise<string | null> => {
      if (!user) return 'No hay sesión activa.';

      setSaving(true);
      const { error } = await supabase.from('perfiles').update(changes).eq('id', user.id);
      setSaving(false);

      if (error) {
        return `No se pudo guardar: ${error.message}`;
      }

      await refetch();
      return null;
    },
    [user, refetch]
  );

  return { updateProfile, saving };
}
