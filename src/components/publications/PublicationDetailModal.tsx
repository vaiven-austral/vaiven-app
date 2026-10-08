import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Badge } from '../ui/badge';
import { PublicationImage } from './PublicationImage';
import { isPublicationExpired } from '../../lib/publicationState';
import {
  type Publication,
  estadoLabels,
  estadoVariants,
  urgenciaLabels,
  urgenciaVariants,
  estadoObjetoLabels,
  estadoObjetoVariant,
  tipoLabels,
  tipoVariant,
  vencidaLabel,
  vencidaVariant,
} from '../../lib/publicationBadges';

interface PublicationDetailModalProps {
  publication: Publication;
  onClose: () => void;
}

export function PublicationDetailModal({ publication, onClose }: PublicationDetailModalProps) {
  const {
    tipo,
    estado,
    titulo,
    descripcion,
    vence_en,
    urgencia,
    estado_objeto,
    categorias,
    zonas,
    imagenes_publicacion,
  } = publication;

  const imagenes = [...(imagenes_publicacion ?? [])].sort((a, b) => a.orden - b.orden);
  const vencida = estado !== 'completada' && isPublicationExpired(vence_en);
  const [indice, setIndice] = useState(0);
  const rutaActual = imagenes[indice]?.ruta_storage;

  function anterior() {
    setIndice((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  }

  function siguiente() {
    setIndice((i) => (i === imagenes.length - 1 ? 0 : i + 1));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full sm:max-w-[390px] max-h-[90vh] overflow-y-auto rounded-tarjeta bg-tarjeta shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end p-2 border-b border-borde">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-pill text-texto-medio hover:bg-lienzo"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <div className="flex flex-col">
        <div className="relative w-full shrink-0 bg-lienzo">
          <PublicationImage
            rutaStorage={rutaActual}
            categoria={categorias?.nombre}
            fit="contain"
            className="h-56 w-full"
          />

          {imagenes.length > 1 && (
            <>
              <button
                type="button"
                onClick={anterior}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-tinta/60 text-tarjeta"
              >
                <Icon icon={ChevronLeft} size={18} />
              </button>
              <button
                type="button"
                onClick={siguiente}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-tinta/60 text-tarjeta"
              >
                <Icon icon={ChevronRight} size={18} />
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                {imagenes.map((imagen, i) => (
                  <span
                    key={imagen.orden}
                    className={`h-1.5 w-1.5 rounded-pill ${i === indice ? 'bg-tarjeta' : 'bg-tarjeta/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 p-6">
          <h2 className="mb-3 font-800 text-xl text-tinta">{titulo}</h2>

          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant={tipoVariant}>{tipoLabels[tipo]}</Badge>
            {vencida && <Badge variant={vencidaVariant}>{vencidaLabel}</Badge>}
            <Badge variant={estadoVariants[estado]}>{estadoLabels[estado]}</Badge>
            {categorias && <Badge variant="secondary">{categorias.nombre}</Badge>}
            {tipo === 'necesidad' && urgencia && (
              <Badge variant={urgenciaVariants[urgencia]}>{urgenciaLabels[urgencia]}</Badge>
            )}
            {tipo === 'donacion' && estado_objeto && (
              <Badge variant={estadoObjetoVariant}>{estadoObjetoLabels[estado_objeto]}</Badge>
            )}
          </div>

          {zonas && (
            <p className="mb-3 text-sm text-texto-medio">
              {zonas.localidad ? `${zonas.localidad}, ${zonas.partido}` : zonas.partido}
            </p>
          )}

          {descripcion && <p className="text-sm leading-relaxed text-texto-medio">{descripcion}</p>}
        </div>
        </div>
      </div>
    </div>
  );
}
