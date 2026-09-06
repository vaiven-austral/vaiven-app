import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { type EstadoPublicacion, esTransicionValida } from '../lib/publicationState';

export async function updatePublicationState(
  publicacionId: string,
  nuevoEstado: 'activa' | 'en_proceso' | 'completada'
) {
  const { data, error } = await supabase
    .from('publicaciones')
    .update({
      estado: nuevoEstado,
      actualizada_en: new Date().toISOString(),
    })
    .eq('id', publicacionId)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No se actualizó ninguna fila (RLS bloqueó la escritura o la publicación no existe)');
  }
}

export function usePublicationState(publicacionId: string, estadoInicial: EstadoPublicacion) {
  const [estado, setEstado] = useState<EstadoPublicacion>(estadoInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function transicionar(nuevoEstado: EstadoPublicacion) {
    if (!esTransicionValida(estado, nuevoEstado)) return;

    setLoading(true);
    setError('');
    try {
      await updatePublicationState(publicacionId, nuevoEstado);
      setEstado(nuevoEstado);
    } catch {
      setError('No se pudo actualizar el estado de la publicación');
    } finally {
      setLoading(false);
    }
  }

  return { estado, loading, error, transicionar };
}
