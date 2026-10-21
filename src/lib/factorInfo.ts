import type { Candidate } from './n8n';

// Qué mide cada fila del desglose. Los pesos (40, 10, 20, 10, 5 y 15, que suman
// 100) están en motor/contrato.md del kit; si cambian, cambian acá y en FactorBars.
export const FACTOR_INFO = {
  resolucion:
    'Lo evalúa la IA: si este objeto resuelve lo que la persona pidió, teniendo en cuenta estado, tamaño y cantidad. Vale hasta 40 puntos.',
  urgencia:
    'Qué tan urgente marcó su necesidad quien la publicó. Vale hasta 10 puntos.',
  estadoDelObjeto:
    'En qué estado está el objeto, de «requiere reparación» a «nuevo». Vale hasta 10 puntos.',
  proximidad:
    'Qué tan cerca están: misma localidad, mismo partido o misma región. Vale hasta 20 puntos.',
  confianza:
    'Si el perfil de quien publicó tiene foto y zona cargadas. Vale hasta 10 puntos.',
  calidad:
    'Si la publicación tiene una descripción completa e imagen. Vale hasta 5 puntos.',
  categoria:
    'Si las dos publicaciones son de la misma categoría. Vale 15 puntos o nada.',
  total:
    'Suma de los seis factores, sobre 100. Cuanto más alto, mejor resuelve este candidato lo que se publicó.',
} as const;

// La segunda fila cambia con el candidato: si es una necesidad, mide su urgencia;
// si es una donación, el estado del objeto.
export function infoSegundaFila(tipo: Candidate['tipo']): string {
  return tipo === 'necesidad' ? FACTOR_INFO.urgencia : FACTOR_INFO.estadoDelObjeto;
}
