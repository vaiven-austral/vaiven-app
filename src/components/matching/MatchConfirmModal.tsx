import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

interface MatchConfirmModalProps {
  publicationId: string;
  tipo: 'donacion' | 'necesidad';
  titulo: string;
  onClose: () => void;
}

export function MatchConfirmModal({ publicationId, tipo, titulo, onClose }: MatchConfirmModalProps) {
  const navigate = useNavigate();
  const nombreTipo = tipo === 'donacion' ? 'Donación' : 'Necesidad';

  function handleConfirm() {
    navigate(`/matching/${publicationId}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-tarjeta bg-tarjeta p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-700 text-lg text-tinta mb-2">¿Querés hacer el matcheo?</h2>
        <p className="text-texto-medio text-sm mb-6">
          Vamos a buscar candidatos compatibles para esta {nombreTipo.toLowerCase()}: <span className="font-600 text-tinta">{titulo}</span>
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Sí, buscar
          </Button>
        </div>
      </div>
    </div>
  );
}
