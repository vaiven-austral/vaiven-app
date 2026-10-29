import type { Publication } from './publicationBadges';
import { isPublicationExpired } from './publicationState';

export type GrupoHistorial = 'activas' | 'en_proceso' | 'vencidas' | 'completadas';

export interface GrupoDePublicaciones {
  grupo: GrupoHistorial;
  titulo: string;
  publicaciones: Publication[];
}

// El orden en que se muestran los grupos.
const GRUPOS: { grupo: GrupoHistorial; titulo: string }[] = [
  { grupo: 'activas', titulo: 'Activas' },
  { grupo: 'en_proceso', titulo: 'En proceso' },
  { grupo: 'vencidas', titulo: 'Vencidas' },
  { grupo: 'completadas', titulo: 'Completadas' },
];

// En qué grupo va una publicación. Una completada es completada aunque su fecha
// haya pasado; una activa o en proceso con la fecha pasada es vencida. Es la
// misma regla de vencida que usa la tarjeta (isPublicationExpired).
export function grupoDe(publicacion: Publication): GrupoHistorial {
  if (publicacion.estado === 'completada') return 'completadas';
  if (isPublicationExpired(publicacion.vence_en)) return 'vencidas';
  return publicacion.estado === 'en_proceso' ? 'en_proceso' : 'activas';
}

// Agrupa conservando el orden de llegada dentro de cada grupo, y deja afuera
// los grupos vacíos.
export function agruparPublicaciones(publicaciones: Publication[]): GrupoDePublicaciones[] {
  return GRUPOS.map(({ grupo, titulo }) => ({
    grupo,
    titulo,
    publicaciones: publicaciones.filter((p) => grupoDe(p) === grupo),
  })).filter((g) => g.publicaciones.length > 0);
}
