import { useEffect, useState } from 'react';
import { Select } from '../ui/select';
import { supabase } from '../../lib/supabaseClient';

interface Categoria {
  id: number;
  nombre: string;
}

interface CategorySelectProps {
  value: number | null;
  onChange: (categoriaId: number | null) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchCategorias() {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nombre')
        .eq('activa', true)
        .order('orden', { ascending: true });

      if (cancelled) return;

      if (error) {
        setError('No se pudieron cargar las categorías');
      } else {
        setCategorias(data ?? []);
      }
      setLoading(false);
    }

    fetchCategorias();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = loading
    ? [{ value: '', label: 'Cargando...' }]
    : [
        { value: '', label: 'Seleccionar categoría' },
        ...categorias.map((categoria) => ({
          value: String(categoria.id),
          label: categoria.nombre,
        })),
      ];

  return (
    <Select
      label="Categoría"
      options={options}
      value={value !== null ? String(value) : ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={loading}
      error={error}
    />
  );
}
