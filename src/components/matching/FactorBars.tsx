import type { Candidate } from '@/lib/n8n';
import { calcularRango, RAMPAS } from '@/lib/scoreRing';

interface FactorBarsProps {
  candidate: Candidate;
}

export function FactorBars({ candidate }: FactorBarsProps) {
  const factores = [
    { label: 'Resolución', value: candidate.factores.f1_resolucion, max: 40 },
    {
      label: candidate.tipo === 'necesidad' ? 'Urgencia' : 'Estado del objeto',
      value: candidate.factores.f2_urgencia,
      max: 10,
    },
    { label: 'Proximidad', value: candidate.factores.f3_proximidad, max: 20 },
    { label: 'Confianza', value: candidate.factores.f4_confianza, max: 10 },
    { label: 'Calidad', value: candidate.factores.f5_calidad, max: 5 },
    { label: 'Categoría', value: candidate.factores.f6_categoria, max: 15 },
  ];

  const rango = calcularRango(candidate.score_total);
  const rampa = RAMPAS[rango];

  return (
    <div>
      <div className="space-y-1.5">
        {factores.map((factor, i) => {
          const valorNumerico = factor.value ?? 0;
          const anchoBarra = factor.value !== null ? (valorNumerico / factor.max) * 100 : 0;

          return (
            <div key={factor.label} className="flex items-center justify-between text-xs">
              <span className="text-texto-medio">{factor.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      backgroundColor: rampa[i] ?? rampa[rampa.length - 1],
                      width: `${anchoBarra}%`,
                    }}
                  ></div>
                </div>
                <span className="text-tinta font-semibold min-w-[3.5rem] text-right">
                  {factor.value === null
                    ? 'Pendiente'
                    : factor.value === 0
                    ? '0 puntos'
                    : factor.value.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-300">
        <div className="flex justify-between text-xs font-bold text-tinta">
          <span>Total</span>
          <span>
            {candidate.score_total !== null
              ? `${Math.round(candidate.score_total)} pts`
              : 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
}
