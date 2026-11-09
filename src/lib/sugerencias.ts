import { supabase } from './supabaseClient';
import { isPublicationExpired } from './publicationState';
import type { Publication } from './publicationBadges';

// Un juicio de este nivel o más hace compatible al otro lado (motor/contrato.md).
export const NIVEL_COMPATIBLE = 2;

type Tipo = Publication['tipo'];

// La publicación propia destacada y cuántos candidatos compatibles tiene, o
// «evaluando» si todavía hay pares sin juzgar, o nada.
export type Sugerencia =
  | { tipo: 'compatibles'; publicacion: Pick<Publication, 'id' | 'tipo' | 'titulo'>; cantidad: number }
  | { tipo: 'evaluando' }
  | null;

interface LadoDelJuicio {
  estado: Publication['estado'];
  vence_en: string;
}

// Un lado llega null si la base no lo deja leer (por ejemplo, ajeno y completado).
export interface JuicioConLados {
  donacion_id: string;
  necesidad_id: string;
  nivel: number;
  donacion: LadoDelJuicio | null;
  necesidad: LadoDelJuicio | null;
}

const SELECT_JUICIOS =
  'donacion_id, necesidad_id, nivel, donacion:publicaciones!donacion_id(estado, vence_en), necesidad:publicaciones!necesidad_id(estado, vence_en)';

function esVigente(lado: LadoDelJuicio | null): boolean {
  return lado !== null && lado.estado === 'activa' && !isPublicationExpired(lado.vence_en);
}

// Los juicios de una publicación propia cuyo otro lado está vigente.
function juiciosVigentesDe(propia: Publication, juicios: JuicioConLados[]): JuicioConLados[] {
  return juicios.filter((j) =>
    propia.tipo === 'donacion'
      ? j.donacion_id === propia.id && esVigente(j.necesidad)
      : j.necesidad_id === propia.id && esVigente(j.donacion)
  );
}

// La decisión, sin consultas. `propias` viene de la más nueva a la más vieja: en
// un empate gana la más reciente. `candidatosPorTipo` es cuántas publicaciones
// vigentes de otros usuarios hay de cada tipo.
export function elegirSugerencia(
  propias: Publication[],
  juicios: JuicioConLados[],
  candidatosPorTipo: Record<Tipo, number>
): Sugerencia {
  const activas = propias.filter((p) => p.estado === 'activa' && !isPublicationExpired(p.vence_en));

  let mejor: { publicacion: Publication; cantidad: number } | null = null;
  for (const propia of activas) {
    const cantidad = juiciosVigentesDe(propia, juicios).filter(
      (j) => j.nivel >= NIVEL_COMPATIBLE
    ).length;
    if (cantidad > 0 && (mejor === null || cantidad > mejor.cantidad)) {
      mejor = { publicacion: propia, cantidad };
    }
  }

  if (mejor) {
    const { id, tipo, titulo } = mejor.publicacion;
    return { tipo: 'compatibles', publicacion: { id, tipo, titulo }, cantidad: mejor.cantidad };
  }

  // Sin compatibles: si hay más candidatos que juicios, el motor todavía está evaluando.
  const evaluando = activas.some((propia) => {
    const opuesto: Tipo = propia.tipo === 'donacion' ? 'necesidad' : 'donacion';
    return candidatosPorTipo[opuesto] > juiciosVigentesDe(propia, juicios).length;
  });

  return evaluando ? { tipo: 'evaluando' } : null;
}

async function contarCandidatos(tipoOpuesto: Tipo, usuarioId: string): Promise<number> {
  const { count, error } = await supabase
    .from('publicaciones')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', tipoOpuesto)
    .eq('estado', 'activa')
    .gt('vence_en', new Date().toISOString())
    .neq('usuario_id', usuarioId);

  if (error) throw error;
  return count ?? 0;
}

// La sugerencia para la tarjeta del inicio. No filtra juicios por usuario: la
// política ya devuelve sólo los pares donde el usuario es dueño de un lado. Si
// una consulta falla, lanza: quien llama decide no mostrar la tarjeta.
export async function fetchSugerencia(
  propias: Publication[],
  usuarioId: string
): Promise<Sugerencia> {
  if (!propias.some((p) => p.estado === 'activa')) return null;

  const { data, error } = await supabase.from('juicios').select(SELECT_JUICIOS);
  if (error) throw error;
  const juicios = (data as unknown as JuicioConLados[]) ?? [];

  const [deDonaciones, deNecesidades] = await Promise.all([
    contarCandidatos('donacion', usuarioId),
    contarCandidatos('necesidad', usuarioId),
  ]);

  return elegirSugerencia(propias, juicios, {
    donacion: deDonaciones,
    necesidad: deNecesidades,
  });
}
