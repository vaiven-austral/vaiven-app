import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchMisPublicaciones } from '../lib/misPublicaciones';
import { PublicationCard, type Publication } from '../components/publications/PublicationCard';
import { EmptyState } from '../components/ui/EmptyState';
import { MatchConfirmModal } from '../components/matching/MatchConfirmModal';

type Tipo = 'donacion' | 'necesidad';

export function MyPublications() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const activeTab: Tipo = pathname === '/mis-necesidades' ? 'necesidad' : 'donacion';

  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicationParaMatch, setPublicationParaMatch] = useState<Publication | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchMine() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchMisPublicaciones(user!.id, activeTab);
        if (cancelled) return;
        setPublicaciones(data);
      } catch {
        if (cancelled) return;
        setError('No se pudieron cargar tus publicaciones');
      }
      setLoading(false);
    }

    fetchMine();
    return () => {
      cancelled = true;
    };
  }, [user, activeTab]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-6">Mis Publicaciones</h1>

      <div className="flex bg-lienzo rounded-tarjeta p-1 mb-6">
        <Link
          to="/mis-donaciones"
          className={`flex-1 text-center px-4 py-3 rounded-boton font-600 text-sm ${
            activeTab === 'donacion' ? 'bg-tarjeta text-tinta shadow-sm' : 'text-texto-medio'
          }`}
        >
          Mis Donaciones
        </Link>
        <Link
          to="/mis-necesidades"
          className={`flex-1 text-center px-4 py-3 rounded-boton font-600 text-sm ${
            activeTab === 'necesidad' ? 'bg-tarjeta text-tinta shadow-sm' : 'text-texto-medio'
          }`}
        >
          Mis Necesidades
        </Link>
      </div>

      {loading && <p className="text-texto-medio">Cargando...</p>}

      {!loading && error && <p className="text-critico">{error}</p>}

      {!loading && !error && publicaciones.length === 0 && (
        <EmptyState
          title={
            activeTab === 'donacion'
              ? 'Todavía no publicaste ninguna donación'
              : 'Todavía no publicaste ninguna necesidad'
          }
          description="Creá tu primera publicación para empezar."
          actionLabel="Crear una publicación"
          actionTo={activeTab === 'donacion' ? '/publicar/donacion' : '/publicar/necesidad'}
        />
      )}

      {!loading && !error && publicaciones.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {publicaciones.map((publication) => (
            <PublicationCard
              key={publication.id}
              publication={publication}
              onClick={() => setPublicationParaMatch(publication)}
            />
          ))}
        </div>
      )}

      {publicationParaMatch && (
        <MatchConfirmModal
          publicationId={publicationParaMatch.id}
          tipo={publicationParaMatch.tipo}
          titulo={publicationParaMatch.titulo}
          onClose={() => setPublicationParaMatch(null)}
        />
      )}
    </div>
  );
}
