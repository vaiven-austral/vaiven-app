import type { ReactNode } from 'react';
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
  onClick?: () => void;
}

interface TransitionButtonProps {
  variant: 'outline' | 'primary' | 'ghost';
  isLoading: boolean;
  onClick: () => void;
  children: ReactNode;
}

function TransitionButton({ variant, isLoading, onClick, children }: TransitionButtonProps) {
  return (
    <Button
      size="sm"
      variant={variant}
      isLoading={isLoading}
      disabled={isLoading}
      className="!h-8 !px-3 !text-xs"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </Button>
  );
}

export function PublicationCard({ publication, onClick }: PublicationCardProps) {
  const { id, tipo, titulo, vence_en, urgencia, estado_objeto, categorias, zonas } = publication;
  const { estado, loading, error, transicionar } = usePublicationState(id, publication.estado);
  const vencida = estado !== 'completada' && isPublicationExpired(vence_en);

  return (
    <div
      className={`bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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
            <TransitionButton variant="outline" isLoading={loading} onClick={() => transicionar('en_proceso')}>
              Marcar en proceso
            </TransitionButton>
          )}

          {estado === 'en_proceso' && (
            <>
              <TransitionButton variant="primary" isLoading={loading} onClick={() => transicionar('completada')}>
                Completar entrega
              </TransitionButton>
              <TransitionButton variant="ghost" isLoading={loading} onClick={() => transicionar('activa')}>
                Volver a activa
              </TransitionButton>
            </>
          )}
        </div>
      )}

      {error && <p className="text-critico text-sm mt-2 font-500">{error}</p>}
    </div>
  );
}
