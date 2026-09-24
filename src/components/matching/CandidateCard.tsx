import { useState } from 'react';
import type { Candidate } from '@/lib/n8n';
import { Sparkles } from 'lucide-react';
import { ScoreRing } from './ScoreRing';
import { AnalysisPanel } from './AnalysisPanel';

interface CandidateCardProps {
  candidate: Candidate;
  onAccept?: (candidateId: string) => void;
}

export function CandidateCard({ candidate, onAccept }: CandidateCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const location = candidate.zonas
    ? `${candidate.zonas.partido} · ${candidate.zonas.localidad}`
    : 'Ubicación no disponible';

  return (
    <div className="bg-tarjeta rounded-tarjeta shadow-md mb-4 overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex gap-3 items-start">
          {/* Anillo de puntaje */}
          <div className="flex-shrink-0">
            <ScoreRing score={candidate.score_total} factores={candidate.factores} size="tarjeta" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-tinta line-clamp-2">
              {candidate.titulo}
            </h3>
            <p className="text-xs text-texto-suave mt-0.5">
              {candidate.tipo === 'donacion' ? '🎁' : '🤲'} {location}
            </p>
            <p className="text-xs text-texto-medio line-clamp-2 mt-1">
              {candidate.descripcion}
            </p>
          </div>
        </div>

        {/* Botón para abrir el panel de análisis */}
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium text-tinta"
        >
          <Sparkles className="w-4 h-4" />
          Ver análisis de IA
        </button>
      </div>

      <AnalysisPanel
        candidate={candidate}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onAccept={onAccept ? async () => onAccept(candidate.id) : undefined}
      />
    </div>
  );
}
