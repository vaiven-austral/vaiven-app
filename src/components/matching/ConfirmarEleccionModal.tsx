import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@/components/ui/button';
import { elegirCandidato, mensajeErrorEleccion, rutaContacto } from '@/lib/eleccion';

interface ConfirmarEleccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donacionId: string;
  necesidadId: string;
  tituloDonacion: string;
  tituloNecesidad: string;
}

// «Sí, elegir» guarda la elección con la función de la base y navega a la
// pantalla del contacto. Si falla, el modal sigue abierto con el motivo.
export function ConfirmarEleccionModal({
  open,
  onOpenChange,
  donacionId,
  necesidadId,
  tituloDonacion,
  tituloNecesidad,
}: ConfirmarEleccionModalProps) {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  // Guardia contra el segundo toque: el estado se actualiza un instante tarde.
  const enviandoRef = useRef(false);

  async function handleConfirm() {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setError('');

    try {
      await elegirCandidato(donacionId, necesidadId);
      onOpenChange(false);
      navigate(rutaContacto(donacionId));
    } catch (err) {
      setError(mensajeErrorEleccion(err));
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }

  // Mientras se envía no se cierra, ni con Esc ni tocando el fondo.
  function handleOpenChange(next: boolean) {
    if (enviandoRef.current) return;
    if (!next) setError('');
    onOpenChange(next);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
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
            {error && (
              <p className="text-critico text-sm mb-4" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <AlertDialog.Close render={<Button variant="ghost" size="sm" disabled={enviando} />}>
                Cancelar
              </AlertDialog.Close>
              <Button variant="primary" size="sm" isLoading={enviando} onClick={handleConfirm}>
                Sí, elegir
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
