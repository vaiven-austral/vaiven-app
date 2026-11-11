import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';

interface ChipCategoriaProps {
  id: number;
  nombre: string;
  necesidades: number;
}

// Un chip del bloque «Tus categorías» del inicio. Lleva a Publicar donación con
// la categoría ya elegida. Sin necesidades va atenuado, pero se puede tocar igual.
// Sólo muestra el conteo: no enlaza ni lista publicaciones de otros.
export function ChipCategoria({ id, nombre, necesidades }: ChipCategoriaProps) {
  const activas = necesidades === 1 ? 'necesidad activa' : 'necesidades activas';

  return (
    <Link
      to={`/publicar/donacion?categoria=${id}`}
      aria-label={`${nombre}: ${necesidades} ${activas}. Publicar una donación`}
      className={`inline-flex items-center gap-2 rounded-chip border border-borde bg-tarjeta px-3 py-2 ${
        necesidades === 0 ? 'opacity-60' : ''
      }`}
    >
      <span className="font-600 text-sm text-tinta">{nombre}</span>
      <Badge variant={necesidades === 0 ? 'neutral' : 'primary'}>{necesidades}</Badge>
    </Link>
  );
}
