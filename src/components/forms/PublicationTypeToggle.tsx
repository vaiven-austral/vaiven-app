import { Link, useLocation } from 'react-router-dom';

export function PublicationTypeToggle() {
  const { pathname } = useLocation();
  const isNecesidad = pathname === '/publicar/necesidad';

  return (
    <div className="flex bg-lienzo rounded-tarjeta p-1 mb-6">
      <Link
        to="/publicar/donacion"
        className={`flex-1 text-center px-4 py-3 rounded-boton font-600 text-sm ${
          !isNecesidad ? 'bg-tarjeta text-tinta shadow-sm' : 'text-texto-medio'
        }`}
      >
        Quiero donar
      </Link>
      <Link
        to="/publicar/necesidad"
        className={`flex-1 text-center px-4 py-3 rounded-boton font-600 text-sm ${
          isNecesidad ? 'bg-tarjeta text-tinta shadow-sm' : 'text-texto-medio'
        }`}
      >
        Quiero recibir
      </Link>
    </div>
  );
}
