import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getPublicationImageUrl } from '../../lib/storage';

interface PublicationImageProps {
  rutaStorage: string | null | undefined;
  className?: string;
}

export function PublicationImage({ rutaStorage, className = '' }: PublicationImageProps) {
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
    return (
      <div className={`flex items-center justify-center bg-lienzo text-texto-suave ${className}`}>
        <ImageOff size={24} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className={`object-cover ${className}`}
      onError={() => setBrokenFor(rutaStorage ?? null)}
    />
  );
}
