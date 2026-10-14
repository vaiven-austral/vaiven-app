import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { callN8nWebhook, WebhookError } from '@/lib/n8n';
import type { Candidate } from '@/lib/n8n';
import { CandidateCard } from '@/components/matching/CandidateCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Lock, FileX, AlertCircle, WifiOff } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

export function MatchingResultsPage() {
  const { publicacionId } = useParams<{ publicacionId: string }>();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [categorias, setCategorias] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('categorias')
      .select('id, nombre')
      .then(({ data }) => {
        if (!cancelled && data) {
          const dict: Record<number, string> = {};
          data.forEach(c => { dict[c.id] = c.nombre; });
          setCategorias(dict);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!publicacionId) {
      setError({ message: 'ID de publicación no válido', status: 400 });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await callN8nWebhook(publicacionId);
      setCandidates(data);
    } catch (err) {
      if (err instanceof WebhookError) {
        setError({ message: err.message, status: err.statusCode });
      } else {
        setError({ message: err instanceof Error ? err.message : 'Error desconocido' });
      }
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [publicacionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleRefresh();
  }, [handleRefresh]);

  const renderErrorState = () => {
    if (!error) return null;

    if (error.status === 401) {
      return (
        <EmptyState
          variant="error"
          icon={<Icon icon={Lock} className="w-8 h-8" strokeWidth={1.9} />}
          title="Tu sesión venció. Volvé a iniciar sesión."
          actionLabel="Iniciar sesión"
          actionTo="/login"
        />
      );
    }
    if (error.status === 404) {
      return (
        <EmptyState
          variant="error"
          icon={<Icon icon={FileX} className="w-8 h-8" strokeWidth={1.9} />}
          title="Esta publicación ya no existe o no está activa."
          actionLabel="Volver"
          onAction={() => navigate(-1)}
        />
      );
    }
    if (error.status === 400) {
      return (
        <EmptyState
          variant="error"
          icon={<Icon icon={AlertCircle} className="w-8 h-8" strokeWidth={1.9} />}
          title="No pudimos abrir esta publicación."
          actionLabel="Volver"
          onAction={() => navigate(-1)}
        />
      );
    }
    
    // Red caída u otro
    return (
      <EmptyState
        variant="error"
        icon={<Icon icon={WifiOff} className="w-8 h-8" strokeWidth={1.9} />}
        title="No pudimos buscar candidatos. Probá de nuevo."
        actionLabel="Reintentar"
        onAction={handleRefresh}
      />
    );
  };

  return (
    <div className="min-h-screen bg-superficie pb-20">
      {/* Header */}
      <div className="bg-tarjeta border-b border-borde">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-tinta">
            Motor de Match
          </h1>
          <p className="text-sm text-texto-medio mt-1">
            Candidatos sugeridos ordenados por compatibilidad
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Estado: Cargando */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-tarjeta rounded-tarjeta border border-borde p-4 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-lienzo rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-lienzo rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-superficie rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-superficie rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado: Error */}
        {!loading && error && renderErrorState()}

        {/* Estado: Sin candidatos */}
        {!loading && !error && candidates.length === 0 && (
          <EmptyState
            icon={<Icon icon={Users} className="w-8 h-8" strokeWidth={1.9} />}
            title="Todavía no hay nadie del otro lado. Volvé a mirar en un rato."
          />
        )}

        {/* Estado: Éxito */}
        {!loading && !error && candidates.length > 0 && (
          <div>
            <div className="mb-4 p-3 bg-lienzo border border-borde rounded-tarjeta">
              <p className="text-sm text-texto-medio">
                <span className="font-600">{candidates.length} candidato{candidates.length !== 1 ? 's' : ''}</span> encontrado{candidates.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-3">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} categoriaNombre={categorias[candidate.categoria_id]} onAccept={() => {} } />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
