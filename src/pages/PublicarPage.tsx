import { Link } from 'react-router-dom';

export function PublicarPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-2">Nueva publicación</h1>
      <p className="text-texto-medio mb-8">¿Querés donar algo o pedir algo que necesitás?</p>

      <div className="grid grid-cols-1 gap-4">
        <Link
          to="/publicar/donacion"
          className="bg-tarjeta rounded-tarjeta border border-borde shadow-sm p-6 text-left hover:border-primario transition-colors"
        >
          <p className="font-700 text-tinta text-lg mb-1">Quiero donar</p>
          <p className="text-texto-medio text-sm">Publicá un objeto que ya no usás para que alguien lo reciba.</p>
        </Link>

        <Link
          to="/publicar/necesidad"
          className="bg-tarjeta rounded-tarjeta border border-borde shadow-sm p-6 text-left hover:border-primario transition-colors"
        >
          <p className="font-700 text-tinta text-lg mb-1">Quiero recibir</p>
          <p className="text-texto-medio text-sm">Contá qué necesitás para que un donante te lo pueda ofrecer.</p>
        </Link>
      </div>
    </div>
  );
}
