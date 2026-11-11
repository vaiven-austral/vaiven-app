import { supabase } from './supabaseClient';
import { SELECT_MIS_PUBLICACIONES } from './misPublicaciones';
import type { Publication } from './publicationBadges';

// Una elección recibida: el match y la donación que su dueño eligió para la
// necesidad. La donación llega null cuando la base no la deja leer (ajena y
// completada): la fila existe, pero no hay detalle ni contacto que ofrecer.
export interface EleccionRecibida {
  id: string;
  creado_en: string;
  donacion: Publication | null;
}

// `no_es_tuya`: la necesidad no existe, no es una necesidad o no es de la sesión.
export type EleccionesRecibidas =
  | { tipo: 'no_es_tuya' }
  | { tipo: 'ok'; tituloNecesidad: string; elecciones: EleccionRecibida[] };

const SELECT_ELECCIONES = `id, creado_en, donacion:publicaciones!donacion_id(${SELECT_MIS_PUBLICACIONES})`;

// Las elecciones que recibió una necesidad propia, de la más nueva a la más vieja.
// La política de matches también deja leer al dueño de la donación, así que
// primero se verifica que la necesidad sea de la sesión: si no, no se piden las
// filas. Si una consulta falla, lanza: quien llama decide qué mostrar.
export async function fetchEleccionesRecibidas(
  necesidadId: string,
  usuarioId: string
): Promise<EleccionesRecibidas> {
  const { data: necesidad, error: errorNecesidad } = await supabase
    .from('publicaciones')
    .select('titulo, tipo, usuario_id')
    .eq('id', necesidadId)
    .maybeSingle();

  if (errorNecesidad) throw errorNecesidad;
  if (!necesidad || necesidad.tipo !== 'necesidad' || necesidad.usuario_id !== usuarioId) {
    return { tipo: 'no_es_tuya' };
  }

  const { data, error } = await supabase
    .from('matches')
    .select(SELECT_ELECCIONES)
    .eq('necesidad_id', necesidadId)
    .order('creado_en', { ascending: false });

  if (error) throw error;

  return {
    tipo: 'ok',
    tituloNecesidad: necesidad.titulo,
    elecciones: (data as unknown as EleccionRecibida[]) ?? [],
  };
}
