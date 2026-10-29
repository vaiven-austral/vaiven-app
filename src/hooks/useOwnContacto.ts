import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabaseClient';
import type { Contacto, MedioPreferido } from '../lib/contacto';

interface CambiosContacto {
  telefono: string | null;
  medio_preferido: MedioPreferido | null;
}

// El contacto propio. Un usuario nuevo no tiene fila, así que `contacto` es null.
// guardarContacto hace upsert sobre la clave de la tabla y nunca borra la fila:
// vaciar el contacto es guardar los tres campos en null.
export function useOwnContacto() {
  const { user } = useAuth();
  const userId = user?.id;
  const [contacto, setContacto] = useState<Contacto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function cargar() {
      const { data, error } = await supabase
        .from('contactos')
        .select('telefono, email_contacto, medio_preferido')
        .eq('usuario_id', userId!)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Error al obtener contacto:', error);
      }
      setContacto((data as Contacto | null) ?? null);
      setLoading(false);
    }

    cargar();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Devuelve null si salió bien, o el mensaje de error en español.
  const guardarContacto = useCallback(
    async ({ telefono, medio_preferido }: CambiosContacto): Promise<string | null> => {
      if (!user) return 'No hay sesión activa.';

      const emailContacto = medio_preferido === 'email' ? (user.email ?? null) : null;
      const { error } = await supabase
        .from('contactos')
        .upsert(
          { usuario_id: user.id, telefono, email_contacto: emailContacto, medio_preferido },
          { onConflict: 'usuario_id' }
        );

      if (error) {
        console.error('Error al guardar contacto:', error);
        return 'No se pudo guardar tu contacto. Probá de nuevo.';
      }

      setContacto({ telefono, email_contacto: emailContacto, medio_preferido });
      return null;
    },
    [user]
  );

  return { contacto, loading, guardarContacto };
}
