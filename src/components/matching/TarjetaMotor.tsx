import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import type { Sugerencia } from '../../lib/sugerencias';

interface TarjetaMotorProps {
  sugerencia: Sugerencia;
}

// El texto cambia según sean uno o varios receptores.
function textoDeCompatibles(cantidad: number, titulo: string): string {
  const sugeridos = cantidad === 1 ? 'receptor sugerido' : 'receptores sugeridos';
  return `${cantidad} ${sugeridos} para tu donación "${titulo}"`;
}

// La tarjeta del motor en el inicio. Sin sugerencia (nada, cargando o con error)
// no se muestra. No lleva títulos, fotos ni datos de las publicaciones ajenas.
export function TarjetaMotor({ sugerencia }: TarjetaMotorProps) {
  const navigate = useNavigate();

  if (!sugerencia) return null;

  return (
    <div className="rounded-tarjeta bg-motor p-5 shadow-md">
      <p className="font-700 text-xs uppercase tracking-wider text-tarjeta/60">Motor de match</p>

      <p className="mt-2 flex items-start gap-2 font-600 text-tarjeta">
        <Icon icon={Sparkles} className="mt-0.5 h-5 w-5 shrink-0" />
        {textoDeCompatibles(sugerencia.cantidad, sugerencia.publicacion.titulo)}
      </p>

      <Button
        type="button"
        size="sm"
        className="mt-4"
        onClick={() => navigate(`/matching/${sugerencia.publicacion.id}`)}
      >
        Ver candidatos →
      </Button>
    </div>
  );
}
