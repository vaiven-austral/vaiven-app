import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@/components/ui/button';
import { rutaContacto, type ContactoNavState } from '@/lib/eleccion';

interface ConfirmarEleccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donacionId: string;
  tituloDonacion: string;
  tituloNecesidad: string;
}

// La elección todavía no se guarda (semana 11): «Sí, elegir» sólo navega a la
// pantalla del contacto con los dos títulos en el state de la navegación.
export function ConfirmarEleccionModal({
  open,
  onOpenChange,
  donacionId,
  tituloDonacion,
  tituloNecesidad,
}: ConfirmarEleccionModalProps) {
  const navigate = useNavigate();

  function handleConfirm() {
    onOpenChange(false);
    const state: ContactoNavState = { tituloDonacion, tituloNecesidad };
    navigate(rutaContacto(donacionId), { state });
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        {/* forceRender: abierto desde el drawer es un diálogo anidado, y Base UI
            no dibuja el fondo de uno anidado si no se le pide. */}
        <AlertDialog.Backdrop forceRender className="fixed inset-0 z-[60] bg-tinta/40" />
        <AlertDialog.Viewport className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <AlertDialog.Popup className="w-full sm:max-w-[390px] rounded-tarjeta bg-tarjeta p-6 shadow-lg outline-none">
            <AlertDialog.Title className="font-700 text-lg text-tinta mb-2">
              ¿Elegís a esta persona?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-texto-medio text-sm mb-6">
              Vas a donar <span className="font-600 text-tinta">{tituloDonacion}</span> para{' '}
              <span className="font-600 text-tinta">{tituloNecesidad}</span>. Recién después de
              elegir van a ver el contacto el uno del otro.
            </AlertDialog.Description>
            <div className="flex gap-3 justify-end">
              <AlertDialog.Close render={<Button variant="ghost" size="sm" />}>
                Cancelar
              </AlertDialog.Close>
              <Button variant="primary" size="sm" onClick={handleConfirm}>
                Sí, elegir
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
