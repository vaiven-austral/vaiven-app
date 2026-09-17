import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { callN8nWebhook } from '@/lib/n8n';
import type { Candidate } from '@/lib/n8n';
import { CandidateCard } from '@/components/matching/CandidateCard';
import { supabase } from '@/lib/supabaseClient';
import { PublicationDetailModal } from '@/components/publications/PublicationDetailModal';
import type { Publication } from '@/lib/publicationBadges';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function MatchingResultsPage() {
  const { publicacionId } = useParams<{ publicacionId: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

  const handleRefresh = useCallback(async () => {
    if (!publicacionId) {
      setError('ID de publicación no válido');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await callN8nWebhook(publicacionId);
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [publicacionId]);

  const handleViewDetails = async (candidate: Candidate) => {
    try {
      const { data, error: err } = await supabase
        .from('publicaciones')
        .select(
          'id, tipo, estado, titulo, descripcion, creada_en, vence_en, urgencia, estado_objeto, categorias(nombre), zonas(region, partido, localidad), imagenes_publicacion(ruta_storage, orden)'
        )
        .eq('id', candidate.id)
        .single();

      if (data && !err) {
        setSelectedPublication(data as unknown as Publication);
        return;
      }
    } catch (e) {
      console.error('Error al obtener detalle de la publicación:', e);
    }

    // Fallback con los datos del candidate en memoria
    setSelectedPublication({
      id: candidate.id,
      tipo: candidate.tipo,
      estado: 'activa',
      titulo: candidate.titulo,
      descripcion: candidate.descripcion,
      vence_en: candidate.vence_en,
      urgencia: (candidate.urgencia as Publication['urgencia']) || null,
      estado_objeto: (candidate.estado_objeto as Publication['estado_objeto']) || null,
      categorias: null,
      zonas: candidate.zonas
        ? { partido: candidate.zonas.partido, localidad: candidate.zonas.localidad }
        : null,
      imagenes_publicacion: [],
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Motor de Match
          </h1>
          <p className="text-sm text-gray-600 mt-1">
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
                className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado: Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Error al buscar candidatos</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        )}

        {/* Estado: Sin candidatos */}
        {!loading && !error && candidates.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Aún no hay candidatos
            </h3>
            <p className="text-gray-600 text-sm">
              No encontramos publicaciones complementarias que coincidan con tu búsqueda.
              Intenta más tarde o publica en más categorías.
            </p>
          </div>
        )}

        {/* Estado: Éxito */}
        {!loading && !error && candidates.length > 0 && (
          <div>
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-teal-900">
                <span className="font-semibold">{candidates.length} candidato{candidates.length !== 1 ? 's' : ''}</span> encontrado{candidates.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-3">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPublication && (
        <PublicationDetailModal
          publication={selectedPublication}
          onClose={() => setSelectedPublication(null)}
        />
      )}
    </div>
  );
}
