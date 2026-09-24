import { useEffect, useState } from 'react';

// Mismo umbral que el breakpoint "sm" de Tailwind (640px), el que usa
// AppLayout para el recuadro de celular (w-full sm:max-w-[390px]).
const BREAKPOINT = 640;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
