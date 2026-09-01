import { useEffect, useMemo, useState } from 'react';
import { Select } from '../ui/select';
import { supabase } from '../../lib/supabaseClient';

interface Zona {
  id: number;
  region: string;
  partido: string;
  localidad: string | null;
}

interface ZoneCascadeSelectProps {
  onChange: (zonaId: number | null) => void;
}

export function ZoneCascadeSelect({ onChange }: ZoneCascadeSelectProps) {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [region, setRegion] = useState('');
  const [partido, setPartido] = useState('');
  const [localidad, setLocalidad] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchZonas() {
      const { data, error } = await supabase
        .from('zonas')
        .select('id, region, partido, localidad')
        .eq('activa', true);

      if (cancelled) return;

      if (error) {
        setError('No se pudieron cargar las zonas');
      } else {
        setZonas(data ?? []);
      }
      setLoading(false);
    }

    fetchZonas();
    return () => {
      cancelled = true;
    };
  }, []);

  const regiones = useMemo(
    () => Array.from(new Set(zonas.map((zona) => zona.region))).sort(),
    [zonas]
  );

  const partidos = useMemo(
    () =>
      Array.from(
        new Set(zonas.filter((zona) => zona.region === region).map((zona) => zona.partido))
      ).sort(),
    [zonas, region]
  );

  const localidades = useMemo(
    () =>
      Array.from(
        new Set(
          zonas
            .filter((zona) => zona.region === region && zona.partido === partido && zona.localidad)
            .map((zona) => zona.localidad as string)
        )
      ).sort(),
    [zonas, region, partido]
  );

  useEffect(() => {
    if (!region || !partido || !localidad) {
      onChange(null);
      return;
    }
    const zona = zonas.find(
      (z) => z.region === region && z.partido === partido && z.localidad === localidad
    );
    onChange(zona ? zona.id : null);
  }, [zonas, region, partido, localidad, onChange]);

  function handleRegionChange(nuevaRegion: string) {
    setRegion(nuevaRegion);
    setPartido('');
    setLocalidad('');
  }

  function handlePartidoChange(nuevoPartido: string) {
    setPartido(nuevoPartido);
    setLocalidad('');
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        label="Región"
        options={
          loading
            ? [{ value: '', label: 'Cargando...' }]
            : [
                { value: '', label: 'Seleccionar región' },
                ...regiones.map((r) => ({ value: r, label: r })),
              ]
        }
        value={region}
        onChange={(e) => handleRegionChange(e.target.value)}
        disabled={loading}
        error={error}
      />

      <Select
        label="Partido"
        options={[
          { value: '', label: 'Seleccionar partido' },
          ...partidos.map((p) => ({ value: p, label: p })),
        ]}
        value={partido}
        onChange={(e) => handlePartidoChange(e.target.value)}
        disabled={!region}
      />

      <Select
        label="Localidad"
        options={[
          { value: '', label: 'Seleccionar localidad' },
          ...localidades.map((l) => ({ value: l, label: l })),
        ]}
        value={localidad}
        onChange={(e) => setLocalidad(e.target.value)}
        disabled={!partido}
      />
    </div>
  );
}
