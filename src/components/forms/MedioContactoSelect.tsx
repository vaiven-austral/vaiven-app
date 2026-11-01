import { Check } from 'lucide-react';
import { Icon } from '../ui/icon';
import { MEDIOS_CONTACTO, type MedioPreferido } from '../../lib/contacto';

interface MedioContactoSelectProps {
  value: MedioPreferido | null;
  onChange: (medio: MedioPreferido | null) => void;
}

// Elegir uno de los tres medios. Volver a tocar el elegido lo desmarca, para
// poder dejar el contacto vacío.
export function MedioContactoSelect({ value, onChange }: MedioContactoSelectProps) {
  return (
    <div role="radiogroup" aria-label="Cómo preferís que te contacten" className="flex gap-2">
      {MEDIOS_CONTACTO.map(({ value: medio, label }) => {
        const marcado = value === medio;
        return (
          <button
            key={medio}
            type="button"
            role="radio"
            aria-checked={marcado}
            onClick={() => onChange(marcado ? null : medio)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-pill border px-3 py-2.5 text-sm font-500 ${
              marcado
                ? 'border-primario bg-primario-claro text-exito'
                : 'border-borde-fuerte bg-tarjeta text-tinta'
            }`}
          >
            {marcado && <Icon icon={Check} className="h-4 w-4" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
