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

// Lo que viaja en el state de la navegación hacia la pantalla del contacto.
// No es una elección guardada: si se abre la URL directo, no está.
export interface ContactoNavState {
  tituloDonacion: string;
  tituloNecesidad: string;
}

export function leerContactoNavState(state: unknown): ContactoNavState | null {
  if (typeof state !== 'object' || state === null) return null;
  const { tituloDonacion, tituloNecesidad } = state as Record<string, unknown>;
  if (typeof tituloDonacion !== 'string' || typeof tituloNecesidad !== 'string') return null;
  return { tituloDonacion, tituloNecesidad };
}
