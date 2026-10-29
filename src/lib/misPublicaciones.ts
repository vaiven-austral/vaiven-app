import { supabase } from './supabaseClient';
import type { Publication } from './publicationBadges';

const SELECT_MIS_PUBLICACIONES =
  'id, tipo, estado, titulo, descripcion, creada_en, vence_en, estado_objeto, urgencia, categorias(nombre), zonas(localidad, partido), imagenes_publicacion(ruta_storage, orden)';

// Las publicaciones propias, de la más nueva a la más vieja. Con `tipo` trae
// sólo ese tipo; sin `tipo`, donaciones y necesidades.
//
// El filtro por dueño es obligatorio: la política deja leer a cualquiera las
// publicaciones activas o en proceso de todos. Y no se filtra por `vence_en`:
// el dueño tiene que ver las suyas vencidas (datos/permisos.md).
export async function fetchMisPublicaciones(
  usuarioId: string,
  tipo?: Publication['tipo']
): Promise<Publication[]> {
  let consulta = supabase
    .from('publicaciones')
    .select(SELECT_MIS_PUBLICACIONES)
    .eq('usuario_id', usuarioId);

  if (tipo) consulta = consulta.eq('tipo', tipo);

  const { data, error } = await consulta.order('creada_en', { ascending: false });

  if (error) throw error;
  return (data as unknown as Publication[]) ?? [];
}
