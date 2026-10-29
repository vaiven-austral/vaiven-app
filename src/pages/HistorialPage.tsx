import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchMisPublicaciones } from '../lib/misPublicaciones';
import { agruparPublicaciones } from '../lib/historial';
import {
  fetchMisMatches,
  rolEnMatch,
  PUBLICACION_CERRADA,
  type MiMatch,
} from '../lib/misMatches';
import { PublicationCard, type Publication } from '../components/publications/PublicationCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/card';

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

  // Los matches van aparte: si su consulta falla, el resto del historial se ve igual.
  const userId = user?.id;
  const [matches, setMatches] = useState<MiMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState('');

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function cargarMatches() {
      setMatchesLoading(true);
      setMatchesError('');

      try {
        const data = await fetchMisMatches();
        if (cancelled) return;
        setMatches(data);
      } catch {
        if (cancelled) return;
        setMatchesError('No pudimos cargar tus matches. Probá de nuevo.');
      }
      setMatchesLoading(false);
    }

    cargarMatches();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const grupos = useMemo(() => agruparPublicaciones(publicaciones), [publicaciones]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-6">Historial</h1>

      <section className="mb-8">
        <h2 className="text-lg font-700 text-tinta mb-3">Mis matches</h2>

        {matchesLoading && <p className="text-texto-medio">Cargando...</p>}

        {!matchesLoading && matchesError && <p className="text-critico">{matchesError}</p>}

        {!matchesLoading && !matchesError && matches.length === 0 && (
          <p className="text-texto-medio">Todavía no tenés matches.</p>
        )}

        {!matchesLoading && !matchesError && matches.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match) => (
              <Card key={match.id} className="p-4">
                <p className="font-700 text-xs uppercase text-primario">
                  {userId && rolEnMatch(match, userId)}
                </p>
                <dl className="mt-2 space-y-2">
                  <div>
                    <dt className="text-texto-suave text-xs">Donación</dt>
                    <dd className={match.donacion ? 'text-tinta' : 'text-texto-medio'}>
                      {match.donacion?.titulo ?? PUBLICACION_CERRADA}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-texto-suave text-xs">Necesidad</dt>
                    <dd className={match.necesidad ? 'text-tinta' : 'text-texto-medio'}>
                      {match.necesidad?.titulo ?? PUBLICACION_CERRADA}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        )}
      </section>

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
