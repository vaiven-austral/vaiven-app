// Fuente: docs/ui/tokens.md § «Anillo de puntaje». No dupliques estos valores
// en otro archivo — un corte o una rampa repetida es una que se desincroniza.

export type RangoScore = 'alto' | 'medio' | 'bajo';

export const CORTE_PX: Record<'tarjeta' | 'drawer', number> = {
  tarjeta: 1.5,
  drawer: 3,
};

// Cortes de rango: comparar siempre contra el score SIN redondear.
const CORTE_ALTO = 70;
const CORTE_MEDIO = 40;

export const RAMPAS: Record<RangoScore, string[]> = {
  alto: ['#216869', '#2F7F5D', '#49A078', '#7FBF9C', '#B6DCC7', '#D9EBE1'],
  medio: ['#8A5A06', '#B07A0B', '#D9950F', '#F2B544', '#F7CD7A', '#F9DCA3'],
  bajo: ['#8F1D1D', '#B91C1C', '#DC2626', '#EC6B6B', '#F4A5A5', '#F9D0D0'],
};

export const NUMERO_POR_RANGO: Record<RangoScore, 'exito' | 'atencion' | 'critico'> = {
  alto: 'exito',
  medio: 'atencion',
  bajo: 'critico',
};

export const CANALETA = '#F3F4F6';

export function calcularRango(scoreSinRedondear: number): RangoScore {
  if (scoreSinRedondear >= CORTE_ALTO) return 'alto';
  if (scoreSinRedondear >= CORTE_MEDIO) return 'medio';
  return 'bajo';
}

export interface SegmentoAnillo {
  color: string;
  dasharray: string;
  dashoffset: number;
}

export interface AnilloCalculado {
  segmentos: SegmentoAnillo[];
  finDeTramos: number;
}

/**
 * Un tramo por factor, en el orden en que llegan (factor 1 = paso más
 * oscuro de la rampa). Cada tramo reserva su propio corte al final de su
 * porción — eso mismo separa tramo de tramo y, en el último, separa el
 * final de los tramos de la canaleta, sin caso especial.
 */
export function construirAnillo(
  factores: Record<string, number>,
  rango: RangoScore,
  circunferencia: number,
  corte: number
): AnilloCalculado {
  const rampa = RAMPAS[rango];
  let acumulado = 0;

  const segmentos = Object.values(factores).map((valor, i) => {
    const largoBruto = circunferencia * (valor / 100);
    const largoDibujado = Math.max(largoBruto - corte, 0);
    const segmento: SegmentoAnillo = {
      color: rampa[i] ?? rampa[rampa.length - 1],
      dasharray: `${largoDibujado} ${circunferencia - largoDibujado}`,
      dashoffset: -acumulado,
    };
    acumulado += largoBruto;
    return segmento;
  });

  return { segmentos, finDeTramos: acumulado };
}
