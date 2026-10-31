import { supabase } from './supabaseClient';

export interface ConteoCategoria {
  id: number;
  nombre: string;
  necesidades: number;
}

// Necesidades de otros usuarios que se pueden atender hoy en una categoría. Sólo
// cuenta, no trae filas: el usuario no navega publicaciones ajenas. El estado y el
// vencimiento se filtran acá porque la política deja leer también las en_proceso
// y no mira vence_en.
async function contarNecesidades(categoriaId: number, usuarioId: string): Promise<number> {
  const { count, error } = await supabase
    .from('publicaciones')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', 'necesidad')
    .eq('estado', 'activa')
    .eq('categoria_id', categoriaId)
    .gt('vence_en', new Date().toISOString())
    .neq('usuario_id', usuarioId);

  if (error) throw error;
  return count ?? 0;
}

// Las categorías de interés activas, en el orden de categorias.orden, cada una con
// su conteo. Si una consulta falla, lanza: quien llama decide qué mostrar.
export async function fetchConteosPorCategoria(
  ids: number[],
  usuarioId: string
): Promise<ConteoCategoria[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre')
    .in('id', ids)
    .eq('activa', true)
    .order('orden', { ascending: true });
  if (error) throw error;

  const categorias = data ?? [];
  const conteos = await Promise.all(categorias.map((c) => contarNecesidades(c.id, usuarioId)));

  return categorias.map((c, i) => ({ id: c.id, nombre: c.nombre, necesidades: conteos[i] }));
}
