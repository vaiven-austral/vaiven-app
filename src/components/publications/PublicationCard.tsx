import { useState, type ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { usePublicationState } from '../../hooks/usePublicationState';
import { isPublicationExpired } from '../../lib/publicationState';
import { getPortada } from '../../lib/imagenesPublicacion';
import { PublicationImage } from './PublicationImage';
import { PublicationDetailModal } from './PublicationDetailModal';
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
  tipoLabels,
  tipoVariant,
} from '../../lib/publicationBadges';

export type { Publication };

interface PublicationCardProps {
  publication: Publication;
  onClick?: () => void;
  // Para listas que mezclan donaciones y necesidades (el historial).
  mostrarTipo?: boolean;
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

export function PublicationCard({ publication, onClick, mostrarTipo = false }: PublicationCardProps) {
  const { id, tipo, titulo, vence_en, urgencia, estado_objeto, categorias, zonas, imagenes_publicacion } =
    publication;
  const { estado, loading, error, transicionar } = usePublicationState(id, publication.estado);
  const vencida = estado !== 'completada' && isPublicationExpired(vence_en);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const portada = getPortada(imagenes_publicacion);

  return (
    <div
      className={`bg-tarjeta rounded-tarjeta border border-borde shadow-sm overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <PublicationImage
        rutaStorage={portada?.ruta_storage}
        categoria={categorias?.nombre}
        className="w-full h-40"
      />

      <div className="p-4">
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
        {mostrarTipo && <Badge variant={tipoVariant}>{tipoLabels[tipo]}</Badge>}
        {categorias && <Badge variant="secondary">{categorias.nombre}</Badge>}
        {tipo === 'necesidad' && urgencia && (
          <Badge variant={urgenciaVariants[urgencia]}>{urgenciaLabels[urgencia]}</Badge>
        )}
        {tipo === 'donacion' && estado_objeto && (
          <Badge variant={estadoObjetoVariant}>{estadoObjetoLabels[estado_objeto]}</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="!h-8 !px-3 !text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setMostrarDetalle(true);
          }}
        >
          Ver detalles
        </Button>

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

      {error && <p className="text-critico text-sm mt-2 font-500">{error}</p>}
      </div>

      {mostrarDetalle && (
        <PublicationDetailModal publication={publication} onClose={() => setMostrarDetalle(false)} />
      )}
    </div>
  );
}
