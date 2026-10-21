import { Popover } from '@base-ui/react/popover';
import { Info } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

interface InfoHintProps {
  texto: string;
}

// Ícono de info que abre una explicación corta. Abre con clic, tap o Enter
// (nada de tooltip sólo por hover) y cierra con Esc o tocando afuera.
export function InfoHint({ texto }: InfoHintProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Qué significa"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-pill text-texto-suave hover:text-texto-medio focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primario"
      >
        <Icon icon={Info} className="h-3.5 w-3.5" strokeWidth={1.9} />
      </Popover.Trigger>
      <Popover.Portal>
        {/* z-[70]: el popover se abre desde adentro del drawer (z-50) y tiene que quedar encima. */}
        <Popover.Positioner sideOffset={6} collisionPadding={16} className="z-[70]">
          <Popover.Popup className="max-w-[min(18rem,calc(100vw-2rem))] rounded-boton border border-borde bg-tarjeta p-3 text-xs text-tinta shadow-md outline-none">
            {texto}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
