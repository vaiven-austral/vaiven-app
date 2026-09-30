import { supabase } from './supabaseClient';
import { isPublicationExpired } from './publicationState';
import type { EstadoPublicacion } from './publicationState';

interface PublicationRow {
  tipo: 'donacion' | 'necesidad';
  estado: EstadoPublicacion;
  vence_en: string;
}

interface PublicationTypeCounts {
  donacion: number;
  necesidad: number;
}

export interface PublicationsSummary {
  activas: { total: number; porTipo: PublicationTypeCounts };
  completadas: { total: number; porTipo: PublicationTypeCounts };
}

export const EMPTY_PUBLICATIONS_SUMMARY: PublicationsSummary = {
  activas: { total: 0, porTipo: { donacion: 0, necesidad: 0 } },
  completadas: { total: 0, porTipo: { donacion: 0, necesidad: 0 } },
};

export async function getOwnPublicationsForSummary(usuarioId: string): Promise<PublicationRow[]> {
  const { data, error } = await supabase
    .from('publicaciones')
    .select('tipo, estado, vence_en')
    .eq('usuario_id', usuarioId);

  if (error) {
    console.error('Error al obtener publicaciones para el resumen:', error);
    return [];
  }
  return data;
}

const TIPO_SINGULAR: Record<'donacion' | 'necesidad', string> = {
  donacion: 'donación',
  necesidad: 'necesidad',
};
const TIPO_PLURAL: Record<'donacion' | 'necesidad', string> = {
  donacion: 'donaciones',
  necesidad: 'necesidades',
};

// "2 donaciones · 1 necesidad" — omite el tipo en 0 (no "0 donaciones"). Con
// el total en 0 no queda ninguna parte, así que cae directo en "Todavía
// ninguna".
export function formatTipoBreakdown(porTipo: PublicationTypeCounts): string {
  const partes = (['donacion', 'necesidad'] as const)
    .filter((tipo) => porTipo[tipo] > 0)
    .map((tipo) => `${porTipo[tipo]} ${porTipo[tipo] === 1 ? TIPO_SINGULAR[tipo] : TIPO_PLURAL[tipo]}`);

  return partes.length > 0 ? partes.join(' · ') : 'Todavía ninguna';
}

// Activas: estado activa y no vencida
export function summarizePublications(rows: PublicationRow[]): PublicationsSummary {
  const summary: PublicationsSummary = {
    activas: { total: 0, porTipo: { donacion: 0, necesidad: 0 } },
    completadas: { total: 0, porTipo: { donacion: 0, necesidad: 0 } },
  };

  for (const row of rows) {
    if (row.estado === 'activa' && !isPublicationExpired(row.vence_en)) {
      summary.activas.total += 1;
      summary.activas.porTipo[row.tipo] += 1;
    } else if (row.estado === 'completada') {
      summary.completadas.total += 1;
      summary.completadas.porTipo[row.tipo] += 1;
    }
  }

  return summary;
}
