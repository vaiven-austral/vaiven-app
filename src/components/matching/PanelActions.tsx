import { Check } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { puedeElegir, type PublicacionOrigen } from '@/lib/eleccion';

interface PanelActionsProps {
  origen?: PublicacionOrigen;
  tituloCandidato: string;
}

export function PanelActions({ origen }: PanelActionsProps) {
  // Sin la publicación de origen no sabemos de qué lado está la persona.
  if (!origen) return null;

  if (!puedeElegir(origen)) {
    return (
      <p className="text-sm text-texto-medio text-center">
        Quien dona elige a quién entregar. Si te elige, vas a ver su contacto acá.
      </p>
    );
  }

  return (
    <Button variant="primary" className="w-full">
      <Icon icon={Check} className="h-4 w-4" />
      Elegir a esta persona
    </Button>
  );
}
