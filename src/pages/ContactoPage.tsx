import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { leerContactoNavState } from '@/lib/eleccion';

// Todavía no lee contactos ni ninguna otra tabla (semana 11). Los títulos
// llegan sólo en el state de la navegación: recargada o abierta directo, la
// pantalla muestra el mismo estado vacío sin títulos.
export function ContactoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [titulos] = useState(() => leerContactoNavState(location.state));

  // El navegador conserva el state del historial al recargar: se lo limpia
  // apenas se leyó para que una recarga llegue sin títulos.
  useEffect(() => {
    if (location.state != null) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-800 text-tinta">Contacto</h1>

      {titulos && (
        <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm space-y-3">
          <div>
            <p className="font-700 text-texto-suave text-xs uppercase">Donación</p>
            <p className="font-600 text-tinta">{titulos.tituloDonacion}</p>
          </div>
          <div>
            <p className="font-700 text-texto-suave text-xs uppercase">Necesidad</p>
            <p className="font-600 text-tinta">{titulos.tituloNecesidad}</p>
          </div>
        </div>
      )}

      <EmptyState
        icon={<Icon icon={UserRound} className="w-8 h-8" strokeWidth={1.9} />}
        title="El contacto todavía no está disponible"
      />
    </div>
  );
}
