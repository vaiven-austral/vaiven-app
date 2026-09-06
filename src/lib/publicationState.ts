export type EstadoPublicacion = 'activa' | 'en_proceso' | 'completada';

const TRANSICIONES: Record<EstadoPublicacion, EstadoPublicacion[]> = {
  activa: ['en_proceso'],
  en_proceso: ['completada', 'activa'],
  completada: [],
};

export function esTransicionValida(
  estadoActual: EstadoPublicacion,
  nuevoEstado: EstadoPublicacion
): boolean {
  return TRANSICIONES[estadoActual].includes(nuevoEstado);
}
