import { supabase } from './supabaseClient';

interface PublicacionDelMatch {
  titulo: string;
  usuario_id: string;
}

// Un lado llega null cuando es una publicación ajena completada: la base no la
// deja leer, tampoco desde un match (datos/permisos.md).
export interface MiMatch {
  id: string;
  creado_en: string;
  donacion: PublicacionDelMatch | null;
  necesidad: PublicacionDelMatch | null;
}

const SELECT_MIS_MATCHES =
  'id, creado_en, donacion:publicaciones!donacion_id(titulo, usuario_id), necesidad:publicaciones!necesidad_id(titulo, usuario_id)';

// Los matches propios, del más nuevo al más viejo. No filtra por usuario: la
// política ya devuelve sólo los matches donde el usuario es dueño de un lado.
export async function fetchMisMatches(): Promise<MiMatch[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(SELECT_MIS_MATCHES)
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return (data as unknown as MiMatch[]) ?? [];
}

// Si la donación es del usuario, dona; si no, es dueño de la necesidad. Una
// donación que llega null es ajena, así que ahí el usuario recibe.
export function rolEnMatch(match: MiMatch, usuarioId: string): 'Donás' | 'Recibís' {
  return match.donacion?.usuario_id === usuarioId ? 'Donás' : 'Recibís';
}

export const PUBLICACION_CERRADA = 'Publicación cerrada';
