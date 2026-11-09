import { supabase } from './supabaseClient';
import { isPublicationExpired } from './publicationState';
import type { Publication } from './publicationBadges';

// Un juicio de este nivel o más hace compatible al otro lado (motor/contrato.md).
export const NIVEL_COMPATIBLE = 2;

// La donación propia destacada y cuántos candidatos compatibles tiene, o nada.
export type Sugerencia = {
  publicacion: Pick<Publication, 'id' | 'titulo'>;
  cantidad: number;
} | null;

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

// La decisión, sin consultas. Sólo cuentan las donaciones vigentes con algún
// candidato compatible; gana la de mayor nivel entre sus juicios. `propias` viene
// de la más nueva a la más vieja: en un empate gana la más reciente.
export function elegirSugerencia(propias: Publication[], juicios: JuicioConLados[]): Sugerencia {
  const donaciones = propias.filter(
    (p) => p.tipo === 'donacion' && p.estado === 'activa' && !isPublicationExpired(p.vence_en)
  );

  let mejor: { publicacion: Publication; nivel: number; cantidad: number } | null = null;
  for (const donacion of donaciones) {
    const vigentes = juiciosVigentesDe(donacion, juicios);
    const cantidad = vigentes.filter((j) => j.nivel >= NIVEL_COMPATIBLE).length;
    if (cantidad === 0) continue;

    const nivel = Math.max(...vigentes.map((j) => j.nivel));
    if (mejor === null || nivel > mejor.nivel) {
      mejor = { publicacion: donacion, nivel, cantidad };
    }
  }

  if (!mejor) return null;

  const { id, titulo } = mejor.publicacion;
  return { publicacion: { id, titulo }, cantidad: mejor.cantidad };
}

// La sugerencia para la tarjeta del inicio. No filtra juicios por usuario: la
// política ya devuelve sólo los pares donde el usuario es dueño de un lado. Si
// la consulta falla, lanza: quien llama decide no mostrar la tarjeta.
export async function fetchSugerencia(propias: Publication[]): Promise<Sugerencia> {
  if (!propias.some((p) => p.tipo === 'donacion' && p.estado === 'activa')) return null;

  const { data, error } = await supabase.from('juicios').select(SELECT_JUICIOS);
  if (error) throw error;
  const juicios = (data as unknown as JuicioConLados[]) ?? [];

  return elegirSugerencia(propias, juicios);
}
