import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import {
  type Publication,
  estadoLabels,
  estadoVariants,
  urgenciaLabels,
  urgenciaVariants,
  estadoObjetoLabels,
  estadoObjetoVariant,
  tipoLabels,
  tipoVariant,
} from '../lib/publicationBadges';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MatchConfirmModal } from '../components/matching/MatchConfirmModal';
import { PublicationImage } from '../components/publications/PublicationImage';
import { PublicationDetailModal } from '../components/publications/PublicationDetailModal';
import lightBulbOutline from '../assets/LightBulbOutline.png';

function getPrimerNombre(nombre?: string | null, email?: string | null): string {
  if (nombre) return nombre.trim().split(/\s+/)[0];
  return email ? email.split('@')[0] : '';
}

export function HomeFeed() {
  const { user } = useAuth();
  const nombreVisible = user?.user_metadata?.nombre_visible as string | undefined;
  const primerNombre = getPrimerNombre(nombreVisible, user?.email);

  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicationParaMatch, setPublicationParaMatch] = useState<Publication | null>(null);
  const [publicationParaDetalle, setPublicationParaDetalle] = useState<Publication | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchFeed() {
      const { data, error } = await supabase
        .from('publicaciones')
        .select(
          'id, tipo, estado, titulo, descripcion, creada_en, vence_en, urgencia, estado_objeto, categorias(nombre), zonas(region, partido, localidad), imagenes_publicacion(ruta_storage, orden)'
        )
        .eq('usuario_id', user!.id)
        .in('estado', ['activa', 'en_proceso'])
        .gt('vence_en', new Date().toISOString())
        .order('creada_en', { ascending: false });

      if (cancelled) return;

      if (error) {
        setError('No se pudieron cargar las publicaciones');
      } else {
        setPublicaciones((data as unknown as Publication[]) ?? []);
      }
      setLoading(false);
    }

    fetchFeed();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-6 flex items-center gap-2">
        {primerNombre ? `Hola, ${primerNombre}!` : 'Hola!'}
        <img src={lightBulbOutline} alt="" className="h-8 w-8" />
      </h1>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-700 text-tinta text-lg">Tus Publicaciones Principales</h2>
        <Link to="/mis-donaciones" className="text-primario font-600 text-sm">
          Ver todas
        </Link>
      </div>

      {loading && <p className="text-texto-medio">Cargando publicaciones...</p>}

      {!loading && error && <p className="text-critico">{error}</p>}

      {!loading && !error && publicaciones.length === 0 && (
        <EmptyState
          title="Todavía no tenés publicaciones activas"
          description="Creá tu primera donación o necesidad para verla acá."
          actionLabel="Crear una publicación"
          actionTo="/publicar/donacion"
        />
      )}

      {!loading && !error && publicaciones.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
          {publicaciones.map((publication) => (
            <div
              key={publication.id}
              className="w-40 shrink-0 bg-tarjeta rounded-tarjeta border border-borde shadow-sm overflow-hidden cursor-pointer"
              onClick={() => setPublicationParaMatch(publication)}
            >
              <PublicationImage
                rutaStorage={
                  publication.imagenes_publicacion?.reduce<
                    NonNullable<typeof publication.imagenes_publicacion>[number] | undefined
                  >((menor, img) => (!menor || img.orden < menor.orden ? img : menor), undefined)?.ruta_storage
                }
                categoria={publication.categorias?.nombre}
                className="h-24 w-full"
              />
              <div className="p-3">
                <p className="font-500 text-[14.5px] leading-[150%] text-tinta truncate">{publication.titulo}</p>
                {publication.categorias && (
                  <p className="text-texto-medio text-xs truncate">{publication.categorias.nombre}</p>
                )}
                {publication.zonas && (
                  <p className="text-texto-suave text-xs truncate mb-2">
                    {publication.zonas.localidad
                      ? `${publication.zonas.localidad}, ${publication.zonas.partido}`
                      : publication.zonas.partido}
                  </p>
                )}
                <div className="flex flex-col items-start gap-1 mb-2">
                  <Badge variant={tipoVariant} className="!text-[11px]">
                    {tipoLabels[publication.tipo]}
                  </Badge>
                  <Badge variant={estadoVariants[publication.estado]} className="!text-[11px]">
                    {estadoLabels[publication.estado]}
                  </Badge>
                  {publication.tipo === 'necesidad' && publication.urgencia && (
                    <Badge variant={urgenciaVariants[publication.urgencia]} className="!text-[11px]">
                      {urgenciaLabels[publication.urgencia]}
                    </Badge>
                  )}
                  {publication.tipo === 'donacion' && publication.estado_objeto && (
                    <Badge variant={estadoObjetoVariant} className="!text-[11px]">
                      {estadoObjetoLabels[publication.estado_objeto]}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="!h-7 !px-2 !text-[11px] w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPublicationParaDetalle(publication);
                  }}
                >
                  Ver detalles
                </Button>
              </div>
            </div>
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

      {publicationParaDetalle && (
        <PublicationDetailModal
          publication={publicationParaDetalle}
          onClose={() => setPublicationParaDetalle(null)}
        />
      )}
    </div>
  );
}
