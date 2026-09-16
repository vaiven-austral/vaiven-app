import { useEffect, useState } from 'react';
import { Image, Refrigerator, Sofa, Shirt, Baby, Laptop, BookOpen, HeartPulse, Hammer, House, Bike, Package } from 'lucide-react';
import { getPublicationImageUrl } from '../../lib/storage';

const iconoPorCategoria: Record<string, typeof Image> = {
  'Electrodomésticos': Refrigerator,
  'Muebles y colchones': Sofa,
  'Ropa y calzado': Shirt,
  'Bebés e infancia': Baby,
  'Tecnología': Laptop,
  'Educación y libros': BookOpen,
  'Salud y movilidad': HeartPulse,
  'Herramientas y construcción': Hammer,
  'Hogar y menaje': House,
  'Transporte': Bike,
  'Otros': Package,
};

interface PublicationImageProps {
  rutaStorage: string | null | undefined;
  categoria?: string | null;
  className?: string;
  fit?: 'cover' | 'contain';
}

export function PublicationImage({
  rutaStorage,
  categoria,
  className = '',
  fit = 'cover',
}: PublicationImageProps) {
  const [resolved, setResolved] = useState<{ ruta: string; url: string | null }>({
    ruta: '',
    url: null,
  });
  const [brokenFor, setBrokenFor] = useState<string | null>(null);

  useEffect(() => {
    if (!rutaStorage) return;

    let cancelled = false;
    getPublicationImageUrl(rutaStorage).then((url) => {
      if (!cancelled) setResolved({ ruta: rutaStorage, url });
    });
    return () => {
      cancelled = true;
    };
  }, [rutaStorage]);

  const url = rutaStorage && resolved.ruta === rutaStorage ? resolved.url : null;
  const broken = rutaStorage !== undefined && rutaStorage === brokenFor;
  const mostrarPlaceholder = !rutaStorage || !url || broken;

  if (mostrarPlaceholder) {
    const IconoCategoria = (categoria && iconoPorCategoria[categoria]) || Image;
    return (
      <div className={`flex items-center justify-center bg-lienzo text-texto-suave ${className}`}>
        <IconoCategoria size={24} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
      onError={() => setBrokenFor(rutaStorage ?? null)}
    />
  );
}
