import { Badge } from '../ui/badge';
import {
  type Publication,
  estadoLabels,
  estadoVariants,
  urgenciaLabels,
  urgenciaVariants,
  estadoObjetoLabels,
  estadoObjetoVariant,
} from '../../lib/publicationBadges';

export type { Publication };

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const { tipo, estado, titulo, urgencia, estado_objeto, categorias, zonas } = publication;

  return (
    <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-500 text-[14.5px] leading-[150%] text-tinta">{titulo}</h3>
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
          <Badge variant={estadoObjetoVariant}>{estadoObjetoLabels[estado_objeto]}</Badge>
        )}
      </div>
    </div>
  );
}
