// Dos selecciones de categorías son la misma si tienen los mismos ids, sin
// importar el orden en que se marcaron.
export function mismasCategorias(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

// Cómo se guardan: de menor a mayor.
export function ordenarCategorias(ids: number[]): number[] {
  return [...ids].sort((x, y) => x - y);
}
