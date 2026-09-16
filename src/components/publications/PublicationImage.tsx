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
  const [mostrado, setMostrado] = useState<{ ruta: string; url: string } | null>(null);
  const [brokenFor, setBrokenFor] = useState<string | null>(null);

  useEffect(() => {
    if (!rutaStorage) return;

    let cancelled = false;
    getPublicationImageUrl(rutaStorage).then((url) => {
      if (!cancelled && url) setMostrado({ ruta: rutaStorage, url });
    });
    return () => {
      cancelled = true;
    };
  }, [rutaStorage]);

  const broken = rutaStorage !== undefined && rutaStorage === brokenFor;
  const mostrarPlaceholder = !rutaStorage || !mostrado || broken;

  if (mostrarPlaceholder) {
    const IconoCategoria = (categoria && iconoPorCategoria[categoria]) || Image;
    return (
      <div
        className={`flex items-center justify-center bg-[rgba(73,160,120,0.1)] text-primario ${className}`}
      >
        <IconoCategoria size={28} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={mostrado?.url}
      alt=""
      className={`${fit === 'cover' ? 'object-cover' : 'object-contain object-top'} ${className}`}
      onError={() => setBrokenFor(rutaStorage ?? null)}
    />
  );
}
