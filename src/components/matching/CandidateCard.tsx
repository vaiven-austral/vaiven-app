import { useState } from 'react';
import type { Candidate } from '@/lib/n8n';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onAccept?: (candidateId: string) => void;
}

export function CandidateCard({ candidate, onAccept }: CandidateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const scorePercentage = Math.round(candidate.score_total);
  const location = candidate.zonas
    ? `${candidate.zonas.partido} · ${candidate.zonas.localidad}`
    : 'Ubicación no disponible';

  const handleAccept = async () => {
    setIsAccepting(true);
    if (onAccept) {
      await onAccept(candidate.id);
    }
    setIsAccepting(false);
  };

  return (
    <div className="bg-tarjeta rounded-tarjeta shadow-md mb-4 overflow-hidden border border-gray-200">

      {/* Header: Score + Info */}
      <div className="p-4">
        <div className="flex gap-3 items-start">

          {/* Score Circular */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-full border-4 border-primario flex items-center justify-center bg-gradient-to-br from-primario/10 to-white">
              <div className="text-center">
                <div className="text-base font-bold text-primario">
                  {scorePercentage}
                </div>
                <div className="text-xs text-texto-suave">pts</div>
              </div>
            </div>
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

        {/* Botón Expandir + Aceptar */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium text-tinta"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Detalles
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-primario hover:bg-primario/90 disabled:bg-gray-300 rounded-md transition-colors text-sm font-medium text-white"
          >
            <Check className="w-4 h-4" />
            {isAccepting ? 'Procesando...' : 'Aceptar'}
          </button>
        </div>
      </div>

      {/* Desglose Expandible */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">

          {/* Factores de Scoring */}
          <div>
            <h4 className="text-xs font-bold text-tinta uppercase mb-2">Factores de Scoring</h4>
            <div className="space-y-1.5">
              {[
                { label: 'Resolución', value: candidate.factores.f1_resolucion, max: 40, color: 'bg-teal-600' },
                { label: 'Urgencia', value: candidate.factores.f2_urgencia, max: 25, color: 'bg-orange-500' },
                { label: 'Proximidad', value: candidate.factores.f3_proximidad, max: 20, color: 'bg-blue-500' },
                { label: 'Confianza', value: candidate.factores.f4_confianza, max: 10, color: 'bg-green-500' },
                { label: 'Calidad', value: candidate.factores.f5_calidad, max: 5, color: 'bg-purple-500' },
              ].map((factor) => (
                <div key={factor.label} className="flex items-center justify-between text-xs">
                  <span className="text-texto-medio">{factor.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className={factor.color}
                        style={{ width: `${(factor.value / factor.max) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-tinta font-semibold w-10 text-right">
                      {factor.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-300">
              <div className="flex justify-between text-xs font-bold text-tinta">
                <span>Total</span>
                <span>{candidate.score_total.toFixed(2)} pts</span>
              </div>
            </div>
          </div>

          {/* Fortalezas (Placeholder para IA) */}
          <div>
            <h4 className="text-xs font-bold text-tinta uppercase mb-2">✅ Fortalezas</h4>
            <div className="bg-white p-3 rounded-md border border-green-200 text-xs text-texto-medio">
              <p className="text-texto-suave italic">
                [Análisis de IA pendiente - se mostrarán los puntos fuertes del match aquí]
              </p>
            </div>
          </div>

          {/* Consideraciones (Placeholder para IA) */}
          <div>
            <h4 className="text-xs font-bold text-tinta uppercase mb-2">⚠️ Consideraciones</h4>
            <div className="bg-white p-3 rounded-md border border-orange-200 text-xs text-texto-medio">
              <p className="text-texto-suave italic">
                [Análisis de IA pendiente - se mostrarán las limitaciones o riesgos aquí]
              </p>
            </div>
          </div>

          {/* Razonamiento de IA (Placeholder) */}
          <div>
            <h4 className="text-xs font-bold text-tinta uppercase mb-2">🤖 Razonamiento de IA</h4>
            <div className="bg-white p-3 rounded-md border border-blue-200 text-xs text-texto-medio">
              <p className="text-texto-suave italic">
                [Análisis de IA pendiente - explicación detallada del matching aquí]
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
