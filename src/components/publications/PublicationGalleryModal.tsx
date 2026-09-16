import { Button } from '../ui/button';
import { PublicationImage } from './PublicationImage';

interface PublicationGalleryModalProps {
  imagenes: { ruta_storage: string; orden: number }[];
  onClose: () => void;
}

export function PublicationGalleryModal({ imagenes, onClose }: PublicationGalleryModalProps) {
  const ordenadas = [...imagenes].sort((a, b) => a.orden - b.orden);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-tarjeta bg-tarjeta p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-700 text-lg text-tinta mb-4">Fotos</h2>

        <div className="flex flex-col gap-3">
          {ordenadas.map((imagen) => (
            <PublicationImage
              key={imagen.orden}
              rutaStorage={imagen.ruta_storage}
              className="w-full h-48 rounded-boton"
            />
          ))}
        </div>

        <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
