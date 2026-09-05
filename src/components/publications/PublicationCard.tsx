import { Badge } from '../ui/badge';

export interface Publication {
  id: string;
  tipo: 'donacion' | 'necesidad';
  estado: 'activa' | 'en_proceso' | 'completada';
  titulo: string;
  urgencia?: 'alta' | 'media' | 'sin_apuro' | null;
  estado_objeto?: 'nuevo' | 'como_nuevo' | 'bueno' | 'usado' | 'requiere_reparacion' | null;
  categorias: { nombre: string } | null;
  zonas: { partido: string; localidad: string | null } | null;
}

const estadoLabels: Record<Publication['estado'], string> = {
  activa: 'ACTIVA',
  en_proceso: 'EN PROCESO',
  completada: 'COMPLETADA',
};

const estadoVariants: Record<Publication['estado'], 'primary' | 'warning' | 'secondary'> = {
  activa: 'primary',
  en_proceso: 'warning',
  completada: 'secondary',
};

const urgenciaLabels: Record<NonNullable<Publication['urgencia']>, string> = {
  alta: 'Urgencia Alta',
  media: 'Urgencia Media',
  sin_apuro: 'Sin Apuro',
};

const urgenciaVariants: Record<NonNullable<Publication['urgencia']>, 'destructive' | 'warning' | 'neutral'> = {
  alta: 'destructive',
  media: 'warning',
  sin_apuro: 'neutral',
};

const estadoObjetoLabels: Record<NonNullable<Publication['estado_objeto']>, string> = {
  nuevo: 'Nuevo en caja / sin uso',
  como_nuevo: 'Como nuevo',
  bueno: 'Buen estado',
  usado: 'Usado con detalles',
  requiere_reparacion: 'Requiere reparación',
};

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const { tipo, estado, titulo, urgencia, estado_objeto, categorias, zonas } = publication;

  return (
    <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-700 text-tinta text-base">{titulo}</h3>
        <Badge variant={estadoVariants[estado]}>{estadoLabels[estado]}</Badge>
      </div>

      {zonas && (
        <p className="text-texto-medio text-sm mb-3">
          {zonas.localidad ? `${zonas.localidad}, ${zonas.partido}` : zonas.partido}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {categorias && <Badge variant="secondary">{categorias.nombre}</Badge>}
        {tipo === 'necesidad' && urgencia && (
          <Badge variant={urgenciaVariants[urgencia]}>{urgenciaLabels[urgencia]}</Badge>
        )}
        {tipo === 'donacion' && estado_objeto && (
          <Badge variant="terciario">{estadoObjetoLabels[estado_objeto]}</Badge>
        )}
      </div>
    </div>
  );
}
