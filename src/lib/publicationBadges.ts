import type { EstadoPublicacion } from './publicationState';

export interface Publication {
  id: string;
  tipo: 'donacion' | 'necesidad';
  estado: EstadoPublicacion;
  titulo: string;
  urgencia?: 'alta' | 'media' | 'sin_apuro' | null;
  estado_objeto?: 'nuevo' | 'como_nuevo' | 'bueno' | 'usado' | 'requiere_reparacion' | null;
  categorias: { nombre: string } | null;
  zonas: { partido: string; localidad: string | null } | null;
}

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'neutral'
  | 'tinta-fuerte'
  | 'tinta-media'
  | 'tinta-suave'
  | 'outline';

// El rojo/amarillo quedan reservados para urgencia (ver review en PR #24).
// Estado usa un relleno de tinta que se va desvaneciendo a medida que la
// publicación deja de necesitar atención (activa > en_proceso > completada),
// siempre con texto oscuro para asegurar contraste AA. Estado_objeto es un
// dato descriptivo, no de proceso, por eso usa un estilo distinto (outline)
// que lo diferencia de un vistazo sin depender del color.
export const estadoLabels: Record<Publication['estado'], string> = {
  activa: 'ACTIVA',
  en_proceso: 'EN PROCESO',
  completada: 'COMPLETADA',
};

export const estadoVariants: Record<Publication['estado'], BadgeVariant> = {
  activa: 'tinta-fuerte',
  en_proceso: 'tinta-media',
  completada: 'tinta-suave',
};

export const urgenciaLabels: Record<NonNullable<Publication['urgencia']>, string> = {
  alta: 'Urgencia Alta',
  media: 'Urgencia Media',
  sin_apuro: 'Sin Apuro',
};

export const urgenciaVariants: Record<NonNullable<Publication['urgencia']>, BadgeVariant> = {
  alta: 'destructive',
  media: 'warning',
  sin_apuro: 'neutral',
};

export const estadoObjetoLabels: Record<NonNullable<Publication['estado_objeto']>, string> = {
  nuevo: 'Nuevo/Sin uso',
  como_nuevo: 'Como nuevo',
  bueno: 'Buen estado',
  usado: 'Usado con detalles',
  requiere_reparacion: 'Requiere reparación',
};

export const estadoObjetoVariant: BadgeVariant = 'outline';
