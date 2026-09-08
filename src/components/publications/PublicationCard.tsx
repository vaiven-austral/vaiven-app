import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { usePublicationState } from '../../hooks/usePublicationState';
import { isPublicationExpired } from '../../lib/publicationState';
import {
  type Publication,
  estadoLabels,
  estadoVariants,
  urgenciaLabels,
  urgenciaVariants,
  estadoObjetoLabels,
  estadoObjetoVariant,
  vencidaLabel,
  vencidaVariant,
} from '../../lib/publicationBadges';

export type { Publication };

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const { id, tipo, titulo, vence_en, urgencia, estado_objeto, categorias, zonas } = publication;
  const { estado, loading, error, transicionar } = usePublicationState(id, publication.estado);
  const vencida = estado !== 'completada' && isPublicationExpired(vence_en);

  return (
    <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-500 text-[14.5px] leading-[150%] text-tinta">{titulo}</h3>
        <div className="flex gap-1">
          {vencida && <Badge variant={vencidaVariant}>{vencidaLabel}</Badge>}
          <Badge variant={estadoVariants[estado]}>{estadoLabels[estado]}</Badge>
        </div>
      </div>

      {zonas && (
        <p className="text-texto-medio text-sm mb-3">
          {zonas.localidad ? `${zonas.localidad}, ${zonas.partido}` : zonas.partido}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {categorias && <Badge variant="secondary">{categorias.nombre}</Badge>}
        {tipo === 'necesidad' && urgencia && (
          <Badge variant={urgenciaVariants[urgencia]}>{urgenciaLabels[urgencia]}</Badge>
        )}
        {tipo === 'donacion' && estado_objeto && (
          <Badge variant={estadoObjetoVariant}>{estadoObjetoLabels[estado_objeto]}</Badge>
        )}
      </div>

      {estado !== 'completada' && (
        <div className="flex flex-wrap gap-2">
          {estado === 'activa' && (
            <Button
              size="sm"
              variant="outline"
              isLoading={loading}
              disabled={loading}
              className="!h-8 !px-3 !text-xs"
              onClick={() => transicionar('en_proceso')}
            >
              Marcar en proceso
            </Button>
          )}

          {estado === 'en_proceso' && (
            <>
              <Button
                size="sm"
                variant="primary"
                isLoading={loading}
                disabled={loading}
                className="!h-8 !px-3 !text-xs"
                onClick={() => transicionar('completada')}
              >
                Completar entrega
              </Button>
              <Button
                size="sm"
                variant="ghost"
                isLoading={loading}
                disabled={loading}
                className="!h-8 !px-3 !text-xs"
                onClick={() => transicionar('activa')}
              >
                Volver a activa
              </Button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-critico text-sm mt-2 font-500">{error}</p>}
    </div>
  );
}
