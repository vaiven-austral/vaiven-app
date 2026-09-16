import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function NotFoundPage() {
  const navigate = useNavigate();
  const [segundos, setSegundos] = useState(3);

  useEffect(() => {
    if (segundos === 0) {
      navigate('/feed', { replace: true });
      return;
    }
    const timer = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [segundos, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-superficie p-6">
      <div className="w-full max-w-sm bg-tarjeta rounded-tarjeta shadow-lg border border-borde p-10 text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="sm" />
        </div>

        <p className="font-800 text-8xl leading-none bg-gradient-to-r from-primario to-secundario bg-clip-text text-transparent mb-4">
          404
        </p>

        <h1 className="text-2xl font-800 text-tinta mb-2">¡Ups! Página no encontrada</h1>
        <p className="text-texto-medio mb-6">Esta página no existe o se movió de lugar.</p>

        <div className="inline-flex items-center gap-2 bg-lienzo rounded-boton px-4 py-2">
          <span className="text-texto-medio text-sm">Volviendo al feed en</span>
          <span className="font-700 text-primario tabular-nums">{segundos}</span>
        </div>
      </div>
    </div>
  );
}
