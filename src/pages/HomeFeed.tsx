import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOwnProfile } from '../hooks/useOwnProfile';
import { supabase } from '../lib/supabaseClient';
import { getPortada } from '../lib/imagenesPublicacion';
import { isPublicationExpired } from '../lib/publicationState';
import { fetchSugerencia, type Sugerencia } from '../lib/sugerencias';
import { fetchConteosPorCategoria, type ConteoCategoria } from '../lib/categoriasInicio';
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
import { TarjetaMotor } from '../components/matching/TarjetaMotor';
import { ChipCategoria } from '../components/matching/ChipCategoria';
import { PublicationImage } from '../components/publications/PublicationImage';
import { PublicationDetailModal } from '../components/publications/PublicationDetailModal';
import lightBulbOutline from '../assets/LightBulbOutline.png';

function getPrimerNombre(nombre?: string | null, email?: string | null): string {
  if (nombre) return nombre.trim().split(/\s+/)[0];
  return email ? email.split('@')[0] : '';
}

export function HomeFeed() {
  const { user } = useAuth();
  const { profile } = useOwnProfile();
  const primerNombre = getPrimerNombre(profile?.nombre_visible, user?.email);

  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicationParaMatch, setPublicationParaMatch] = useState<Publication | null>(null);
  const [publicationParaDetalle, setPublicationParaDetalle] = useState<Publication | null>(null);
  // La tarjeta del motor tiene su propio estado: si su consulta falla, no se
  // muestra y el resto del inicio carga igual.
  const [sugerencia, setSugerencia] = useState<Sugerencia>(null);
  const userId = user?.id;
  // «Tus categorías» también tiene su propio estado: un error acá no rompe el inicio.
  const [conteos, setConteos] = useState<ConteoCategoria[]>([]);
  const [conteosLoading, setConteosLoading] = useState(true);
  const [conteosError, setConteosError] = useState(false);
  // Una clave estable, para no volver a consultar cada vez que el perfil cambia de
  // referencia sin cambiar las categorías.
  const categoriasKey = profile ? profile.categorias_interes.join(',') : null;

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

  // Con las publicaciones propias que ya trajo el inicio. Sin ninguna no hay nada
  // que sugerir, así que no se consulta.
  useEffect(() => {
    if (!userId || publicaciones.length === 0) return;

    let cancelled = false;

    async function cargarSugerencia() {
      try {
        const resultado = await fetchSugerencia(publicaciones, userId!);
        if (cancelled) return;
        setSugerencia(resultado);
      } catch (error) {
        console.error('Error al obtener la sugerencia del motor:', error);
        if (cancelled) return;
        setSugerencia(null);
      }
    }

    cargarSugerencia();
    return () => {
      cancelled = true;
    };
  }, [publicaciones, userId]);

  useEffect(() => {
    // Sin categorías elegidas el bloque muestra la invitación y no usa los conteos.
    if (!userId || !categoriasKey) return;

    let cancelled = false;
    const ids = categoriasKey.split(',').map(Number);

    async function cargarConteos() {
      setConteosLoading(true);
      setConteosError(false);
      try {
        const resultado = await fetchConteosPorCategoria(ids, userId!);
        if (cancelled) return;
        setConteos(resultado);
      } catch (error) {
        console.error('Error al cargar los conteos por categoría:', error);
        if (cancelled) return;
        setConteosError(true);
      }
      setConteosLoading(false);
    }

    cargarConteos();
    return () => {
      cancelled = true;
    };
  }, [userId, categoriasKey]);

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
              onClick={() => setPublicationParaDetalle(publication)}
            >
              <PublicationImage
                rutaStorage={getPortada(publication.imagenes_publicacion)?.ruta_storage}
                categoria={publication.categorias?.nombre}
                className="h-24 w-full"
              />
              <div className="p-3">
                {/* Es el control que abre el detalle con teclado (Tab + Enter/Espacio),
                    como el título de PublicationCard. El clic del resto de la tarjeta
                    sigue abriéndolo con el mouse. */}
                <button
                  type="button"
                  className="block w-full text-left font-500 text-[14.5px] leading-[150%] text-tinta truncate rounded-boton focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primario"
                  onClick={() => setPublicationParaDetalle(publication)}
                >
                  {publication.titulo}
                </button>
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
                {/* El motor busca candidatos sólo para publicaciones activas. */}
                {publication.estado === 'activa' && !isPublicationExpired(publication.vence_en) && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="!h-7 !px-2 !text-[11px] w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPublicationParaMatch(publication);
                    }}
                  >
                    Ver match
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sugerencia && (
        <div className="mt-6">
          <TarjetaMotor sugerencia={sugerencia} />
        </div>
      )}

      {profile && (
        <section className="mt-6">
          <h2 className="font-700 text-tinta text-lg">Tus categorías</h2>

          {profile.categorias_interes.length === 0 ? (
            <>
              <p className="mt-1 mb-3 text-texto-medio text-sm">
                Elegí las categorías que te interesan y te mostramos cuántas personas necesitan algo en cada una.
              </p>
              <Link to="/perfil/editar" className="text-primario font-600 text-sm">
                Elegir categorías
              </Link>
            </>
          ) : (
            <>
              <p className="mt-1 mb-3 text-texto-medio text-sm">
                Necesidades activas en lo que te interesa. Tocá una para donar.
              </p>
              {conteosLoading && <p className="text-texto-medio">Cargando...</p>}
              {!conteosLoading && conteosError && (
                <p className="text-critico">No pudimos cargar tus categorías.</p>
              )}
              {!conteosLoading && !conteosError && (
                <div className="flex flex-wrap gap-2">
                  {conteos.map((c) => (
                    <ChipCategoria key={c.id} id={c.id} nombre={c.nombre} necesidades={c.necesidades} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
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
