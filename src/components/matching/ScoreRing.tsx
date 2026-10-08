import { useState, useEffect, useRef } from 'react';
import { CANALETA, CORTE_PX, calcularRango, construirAnillo, NUMERO_POR_RANGO } from '@/lib/scoreRing';

interface ScoreRingProps {
  score: number | null;
  factores: Record<string, number | null>;
  size?: 'tarjeta' | 'drawer';
  className?: string;
}

const DIAMETRO = { tarjeta: 56, drawer: 96 } as const;
const GROSOR = { tarjeta: 6, drawer: 10 } as const;

// Entrada escalonada de 6 tramos en 600 ms total:
// Tramo i: delay i * 70ms, duración 250ms (el tramo 5 termina en 350ms + 250ms = 600ms)
const DURACION_TRAMO_MS = 250;
const DELAY_ESCALONADO_MS = 70;
const TOTAL_ANIMACION_MS = 600;

export function ScoreRing({ score, factores, size = 'tarjeta', className = '' }: ScoreRingProps) {
  const diametro = DIAMETRO[size];
  const grosor = GROSOR[size];
  const radio = (diametro - grosor) / 2;
  const centro = diametro / 2;
  const circunferencia = 2 * Math.PI * radio;

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const [animado, setAnimado] = useState(prefersReducedMotion);
  const [isEntering, setIsEntering] = useState(!prefersReducedMotion);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimado(true);
        });
      });

      const timerId = setTimeout(() => {
        setIsEntering(false);
      }, TOTAL_ANIMACION_MS + 50);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    }
  }, [prefersReducedMotion]);

  if (score === null) {
    return (
      <svg width={diametro} height={diametro} viewBox={`0 0 ${diametro} ${diametro}`} className={className}>
        <circle cx={centro} cy={centro} r={radio} fill="none" stroke={CANALETA} strokeWidth={grosor} />
      </svg>
    );
  }

  const rango = calcularRango(score);
  const { segmentos, finDeTramos } = construirAnillo(factores, rango, circunferencia, CORTE_PX[size]);
  const largoCanaleta = circunferencia - finDeTramos;

  return (
    <svg width={diametro} height={diametro} viewBox={`0 0 ${diametro} ${diametro}`} className={className}>
      <g transform={`rotate(-90 ${centro} ${centro})`}>
        <circle
          cx={centro}
          cy={centro}
          r={radio}
          fill="none"
          stroke={CANALETA}
          strokeWidth={grosor}
          strokeDasharray={`${largoCanaleta} ${finDeTramos}`}
          strokeDashoffset={-finDeTramos}
        />
        {segmentos.map((segmento, i) => {
          const dasharrayActual = animado ? segmento.dasharray : `0 ${circunferencia}`;
          const transition = isEntering
            ? `stroke-dasharray ${DURACION_TRAMO_MS}ms cubic-bezier(0.16, 1, 0.3, 1) ${i * DELAY_ESCALONADO_MS}ms`
            : 'none';

          return (
            <circle
              key={i}
              cx={centro}
              cy={centro}
              r={radio}
              fill="none"
              stroke={segmento.color}
              strokeWidth={grosor}
              strokeDasharray={dasharrayActual}
              strokeDashoffset={segmento.dashoffset}
              strokeLinecap="butt"
              className="score-ring-segment"
              style={{
                strokeDasharray: dasharrayActual,
                transition,
              }}
            />
          );
        })}
      </g>
      <text
        x={centro}
        y={centro}
        textAnchor="middle"
        dominantBaseline="central"
        className={`font-800 fill-current ${NUMERO_POR_RANGO[rango]}`}
        style={{ fontSize: size === 'drawer' ? 22 : 14 }}
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}
