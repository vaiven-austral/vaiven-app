import { supabase } from './supabaseClient';

export interface Zona {
  id: number;
  region: string;
  partido: string;
  localidad: string | null;
}

// "región · partido · localidad", o "región · partido"
export function formatZona(zona: Zona): string {
  return [zona.region, zona.partido, zona.localidad].filter(Boolean).join(' · ');
}

export async function getZona(zonaId: number): Promise<Zona | null> {
  const { data, error } = await supabase
    .from('zonas')
    .select('id, region, partido, localidad')
    .eq('id', zonaId)
    .single();

  if (error) {
    console.error('Error al obtener zona:', error);
    return null;
  }
  return data;
}
