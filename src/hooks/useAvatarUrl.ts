import { useEffect, useState } from 'react';
import { getPublicationImageUrl } from '../lib/storage';

interface Resolved {
  avatarRuta: string;
  url: string | null;
}

// Resuelve avatar_ruta a la URL firmada del bucket privado "publicaciones"
// (mismo bucket y mismo firmador que las fotos de publicación). null
// mientras no hay avatar_ruta o si la URL firmada falla — en los dos casos
// la pantalla cae a las iniciales.
export function useAvatarUrl(avatarRuta: string | null) {
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useEffect(() => {
    if (avatarRuta == null) return;

    let cancelled = false;
    getPublicationImageUrl(avatarRuta).then((url) => {
      if (cancelled) return;
      setResolved({ avatarRuta, url });
    });

    return () => {
      cancelled = true;
    };
  }, [avatarRuta]);

  if (avatarRuta == null) return { url: null, loading: false };
  if (resolved?.avatarRuta !== avatarRuta) return { url: null, loading: true };
  return { url: resolved.url, loading: false };
}
