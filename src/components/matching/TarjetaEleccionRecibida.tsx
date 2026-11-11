import { Button } from '@/components/ui/button';
import { PublicationImage } from '@/components/publications/PublicationImage';
import { getPortada } from '@/lib/imagenesPublicacion';
import { PUBLICACION_CERRADA } from '@/lib/misMatches';
import type { Publication } from '@/lib/publicationBadges';

interface TarjetaEleccionRecibidaProps {
  // La donación que su dueño eligió para la necesidad. null: la base no la deja
  // leer (ajena y completada), así que no hay detalle ni contacto que ofrecer.
  donacion: Publication | null;
  onVerDetalle: (donacion: Publication) => void;
  onVerContacto: (donacionId: string) => void;
}

// Una fila de «Quiénes te eligieron». Tocarla abre el detalle de la donación;
// «Ver contacto» es un botón propio que no abre el detalle. No lleva acciones de
// estado (no es una PublicationCard).
export function TarjetaEleccionRecibida({
  donacion,
  onVerDetalle,
  onVerContacto,
}: TarjetaEleccionRecibidaProps) {
  if (!donacion) {
    return (
      <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm">
        <p className="text-texto-medio">{PUBLICACION_CERRADA}</p>
      </div>
    );
  }

  const { id, titulo, categorias, zonas, imagenes_publicacion } = donacion;
  const zona = zonas ? (zonas.localidad ? `${zonas.localidad}, ${zonas.partido}` : zonas.partido) : null;
  const detalle = [categorias?.nombre, zona].filter(Boolean).join(' · ');

  return (
    <div
      className="bg-tarjeta rounded-tarjeta border border-borde shadow-sm overflow-hidden cursor-pointer"
      onClick={() => onVerDetalle(donacion)}
    >
      <PublicationImage
        rutaStorage={getPortada(imagenes_publicacion)?.ruta_storage}
        categoria={categorias?.nombre}
        className="h-32 w-full"
      />
      <div className="p-4 space-y-2">
        {/* El título es un botón para abrir el detalle con teclado: el clic sube
            hasta la tarjeta. */}
        <h3 className="font-500 text-[14.5px] leading-[150%] text-tinta">
          <button
            type="button"
            className="text-left rounded-boton focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primario"
          >
            {titulo}
          </button>
        </h3>
        {detalle && <p className="text-texto-medio text-xs">{detalle}</p>}
        <Button
          size="sm"
          variant="primary"
          className="!h-8 !px-3 !text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onVerContacto(id);
          }}
        >
          Ver contacto
        </Button>
      </div>
    </div>
  );
}
