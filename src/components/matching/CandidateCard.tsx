import { useState } from 'react';
import type { Candidate } from '@/lib/n8n';
import { Sparkles } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { ScoreRing } from './ScoreRing';
import { AnalysisPanel } from './AnalysisPanel';

interface CandidateCardProps {
  candidate: Candidate;
  categoriaNombre?: string;
  onAccept?: (candidateId: string) => void;
}

export function CandidateCard({ candidate, categoriaNombre, onAccept }: CandidateCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  let zonaTexto = candidate.zonas?.localidad || candidate.zonas?.partido || 'Ubicación no disponible';
  const f3 = candidate.factores?.f3_proximidad;

  if (f3 !== undefined && f3 !== null) {
    const prox = Math.floor(f3);
    if (prox === 20) zonaTexto = 'Misma localidad';
    else if (prox === 13) zonaTexto = 'Mismo partido';
    else if (prox === 6) zonaTexto = 'Misma región';
  }

  const categoriaTexto = categoriaNombre || `Categoría ${candidate.categoria_id}`;

  const isPending = candidate.analizando === true;

  return (
    <div className="bg-tarjeta rounded-tarjeta shadow-md mb-4 overflow-hidden border border-borde">
      <div className="p-4">
        <div className="flex gap-3 items-start">
          {/* Anillo de puntaje */}
          <div className="flex-shrink-0">
            <ScoreRing
              score={isPending ? null : candidate.score_total}
              factores={candidate.factores}
              size="tarjeta"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-tinta line-clamp-2">
              {candidate.titulo}
            </h3>
            <p className="text-xs text-texto-suave mt-0.5">
              {categoriaTexto} · {zonaTexto}
            </p>

            {isPending ? (
              <>
                {/* Aviso IA analizando */}
                <div className="flex items-center gap-1.5 text-xs text-secundario mt-1">
                  <Icon icon={Sparkles} className="w-3.5 h-3.5 shrink-0" strokeWidth={1.9} />
                  <span>La IA todavía está analizando este match.</span>
                </div>
                {/* Chip Resolución · Pendiente */}
                <span className="inline-block mt-2 px-2.5 py-1 text-xs font-medium text-texto-medio bg-lienzo rounded-chip">
                  Resolución · Pendiente
                </span>
              </>
            ) : (
              <p className="text-xs text-texto-medio line-clamp-2 mt-1">
                {candidate.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Botón para abrir el panel de análisis — solo si hay juicio */}
        {!isPending && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 py-2 px-3 bg-lienzo hover:bg-superficie rounded-md transition-colors text-sm font-medium text-tinta"
          >
            <Icon icon={Sparkles} className="w-4 h-4" />
            Ver análisis de IA
          </button>
        )}
      </div>

      {/* Panel de análisis — solo si hay juicio */}
      {!isPending && (
        <AnalysisPanel
          candidate={candidate}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          onAccept={onAccept}
        />
      )}
    </div>
  );
}
