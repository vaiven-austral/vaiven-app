import { useEffect, useState } from 'react';
import { formatZona, getZona } from '../lib/zonas';

interface Resolved {
  zonaId: number;
  label: string | null;
}

// Resuelve zona_id del perfil a "región · partido · localidad".
export function useZonaLabel(zonaId: number | null) {
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useEffect(() => {
    if (zonaId == null) return;

    let cancelled = false;
    getZona(zonaId).then((zona) => {
      if (cancelled) return;
      setResolved({ zonaId, label: zona ? formatZona(zona) : null });
    });

    return () => {
      cancelled = true;
    };
  }, [zonaId]);

  if (zonaId == null) return { label: null, loading: false };
  if (resolved?.zonaId !== zonaId) return { label: null, loading: true };
  return { label: resolved.label, loading: false };
}
