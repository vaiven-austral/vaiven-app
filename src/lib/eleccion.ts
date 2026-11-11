import { supabase } from './supabaseClient';

export type TipoPublicacion = 'donacion' | 'necesidad';

// La publicación desde la que se abrió la pantalla de match.
export interface PublicacionOrigen {
  id: string;
  titulo: string;
  tipo: TipoPublicacion;
}

// Elige siempre el dueño de la donación: sólo la pantalla de match de una
// donación ofrece elegir a un candidato.
export function puedeElegir(origen: PublicacionOrigen): boolean {
  return origen.tipo === 'donacion';
}

export function rutaContacto(donacionId: string): string {
  return `/contacto/${donacionId}`;
}

// La lista de quienes eligieron una necesidad propia.
export function rutaQuienesTeEligieron(necesidadId: string): string {
  return `/quienes-te-eligieron/${necesidadId}`;
}

// Guarda la elección: único camino para crear un match (la función pasa la
// donación a en_proceso y crea la fila de matches en el mismo paso). Devuelve el
// id del match; elegir de nuevo al mismo candidato devuelve el mismo. Si falla,
// lanza: quien llama lo traduce con mensajeErrorEleccion.
export async function elegirCandidato(donacionId: string, necesidadId: string): Promise<string> {
  const { data, error } = await supabase.rpc('elegir_candidato', {
    p_donacion_id: donacionId,
    p_necesidad_id: necesidadId,
  });

  if (error) throw error;
  return data as string;
}

const ERROR_DONACION =
  'Esta donación ya no está disponible: puede que ya hayas elegido a alguien o que haya vencido.';
const ERROR_NECESIDAD = 'Esta necesidad ya no está disponible. Elegí a otra persona.';
const ERROR_GENERICO = 'No pudimos guardar tu elección. Probá de nuevo.';

// La función lanza (RAISE EXCEPTION, código P0001) mensajes que nombran la
// donación o la necesidad: de ahí sale cuál de los dos mostrar. Cualquier otro
// error (red, permisos, la función no existe) es el genérico: sus mensajes pueden
// nombrar p_donacion_id o p_necesidad_id sin que la elección haya fallado por eso.
export function mensajeErrorEleccion(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ERROR_GENERICO;

  const { code, message } = error as { code?: unknown; message?: unknown };
  if (code !== 'P0001') return ERROR_GENERICO;

  const texto = String(message).toLowerCase();
  if (texto.includes('donación') || texto.includes('donacion')) return ERROR_DONACION;
  if (texto.includes('necesidad')) return ERROR_NECESIDAD;
  return ERROR_GENERICO;
}
