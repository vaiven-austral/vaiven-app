import { useState } from 'react';
import { Check } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface PanelActionsProps {
  onAccept?: () => Promise<void> | void;
}

export function PanelActions({ onAccept }: PanelActionsProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  async function handleAccept() {
    if (!onAccept) return;
    setIsAccepting(true);
    await onAccept();
    setIsAccepting(false);
  }

  return (
    <Button
      variant="primary"
      className="w-full"
      onClick={handleAccept}
      disabled={isAccepting}
      isLoading={isAccepting}
    >
      <Icon icon={Check} className="h-4 w-4" />
      {isAccepting ? 'Procesando...' : 'Aceptar'}
    </Button>
  );
}
