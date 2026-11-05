import { useState } from 'react';
import { Check } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { puedeElegir, type PublicacionOrigen } from '@/lib/eleccion';
import { ConfirmarEleccionModal } from './ConfirmarEleccionModal';

interface PanelActionsProps {
  origen?: PublicacionOrigen;
  necesidadId: string;
  tituloCandidato: string;
}

export function PanelActions({ origen, necesidadId, tituloCandidato }: PanelActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    <>
      <Button variant="primary" className="w-full" onClick={() => setConfirmOpen(true)}>
        <Icon icon={Check} className="h-4 w-4" />
        Elegir a esta persona
      </Button>
      <ConfirmarEleccionModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        donacionId={origen.id}
        necesidadId={necesidadId}
        tituloDonacion={origen.titulo}
        tituloNecesidad={tituloCandidato}
      />
    </>
  );
}
