import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchMisPublicaciones } from '../lib/misPublicaciones';
import { agruparPublicaciones } from '../lib/historial';
import { PublicationCard, type Publication } from '../components/publications/PublicationCard';
import { EmptyState } from '../components/ui/EmptyState';

export function HistorialPage() {
  const { user } = useAuth();

  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchHistorial() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchMisPublicaciones(user!.id);
        if (cancelled) return;
        setPublicaciones(data);
      } catch {
        if (cancelled) return;
        setError('No se pudo cargar tu historial');
      }
      setLoading(false);
    }

    fetchHistorial();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const grupos = useMemo(() => agruparPublicaciones(publicaciones), [publicaciones]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-6">Historial</h1>

      {/* Acá arriba va la sección «Mis matches» (SCRUM-144). */}

      {loading && <p className="text-texto-medio">Cargando...</p>}

      {!loading && error && <p className="text-critico">{error}</p>}

      {!loading && !error && publicaciones.length === 0 && (
        <EmptyState
          title="Todavía no publicaste nada"
          description="Lo que publiques va a quedar acá, también cuando se complete o venza."
          actionLabel="Crear una publicación"
          actionTo="/publicar"
        />
      )}

      {!loading && !error && grupos.length > 0 && (
        <div className="flex flex-col gap-8">
          {grupos.map(({ grupo, titulo, publicaciones: delGrupo }) => (
            <section key={grupo}>
              <h2 className="text-lg font-700 text-tinta mb-3">
                {titulo} <span className="text-texto-medio font-500">· {delGrupo.length}</span>
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {delGrupo.map((publication) => (
                  <PublicationCard key={publication.id} publication={publication} mostrarTipo />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
