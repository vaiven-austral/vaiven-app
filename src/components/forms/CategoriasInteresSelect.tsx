import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Icon } from '../ui/icon';
import { supabase } from '../../lib/supabaseClient';

interface Categoria {
  id: number;
  nombre: string;
}

interface CategoriasInteresSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

// Varias categorías a la vez: un chip por categoría que se comporta como casilla.
// Para elegir una sola, está CategorySelect.
export function CategoriasInteresSelect({ value, onChange }: CategoriasInteresSelectProps) {
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

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  if (loading) return <p className="text-texto-medio text-sm">Cargando...</p>;
  if (error) return <p className="text-critico text-sm font-500">{error}</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {categorias.map((categoria) => {
        const marcada = value.includes(categoria.id);
        return (
          <button
            key={categoria.id}
            type="button"
            role="checkbox"
            aria-checked={marcada}
            onClick={() => toggle(categoria.id)}
            className={`inline-flex items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-500 ${
              marcada
                ? 'border-primario bg-primario-claro text-exito'
                : 'border-borde-fuerte bg-tarjeta text-tinta'
            }`}
          >
            {marcada && <Icon icon={Check} className="h-4 w-4" />}
            {categoria.nombre}
          </button>
        );
      })}
    </div>
  );
}
