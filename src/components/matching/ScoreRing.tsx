import { CANALETA, CORTE_PX, calcularRango, construirAnillo, NUMERO_POR_RANGO } from '@/lib/scoreRing';

interface ScoreRingProps {
  score: number | null;
  factores: Record<string, number>;
  size?: 'tarjeta' | 'drawer';
  className?: string;
}

const DIAMETRO = { tarjeta: 56, drawer: 96 } as const;
const GROSOR = { tarjeta: 6, drawer: 10 } as const;

export function ScoreRing({ score, factores, size = 'tarjeta', className = '' }: ScoreRingProps) {
  const diametro = DIAMETRO[size];
  const grosor = GROSOR[size];
  const radio = (diametro - grosor) / 2;
  const centro = diametro / 2;
  const circunferencia = 2 * Math.PI * radio;

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
        {segmentos.map((segmento, i) => (
          <circle
            key={i}
            cx={centro}
            cy={centro}
            r={radio}
            fill="none"
            stroke={segmento.color}
            strokeWidth={grosor}
            strokeDasharray={segmento.dasharray}
            strokeDashoffset={segmento.dashoffset}
            strokeLinecap="butt"
          />
        ))}
      </g>
      <text
        x={centro}
        y={centro}
        textAnchor="middle"
        dominantBaseline="central"
        className={`font-800 fill-current text-${NUMERO_POR_RANGO[rango]}`}
        style={{ fontSize: size === 'drawer' ? 22 : 14 }}
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}
