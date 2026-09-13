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
} from '../lib/publicationBadges';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/badge';
import lightBulbOutline from '../assets/LightBulbOutline.png';

const tipoLabels: Record<Publication['tipo'], string> = {
  donacion: 'DONACIÓN',
  necesidad: 'NECESIDAD',
};

const tipoVariants: Record<Publication['tipo'], 'primary' | 'secondary'> = {
  donacion: 'secondary',
  necesidad: 'secondary',
};

function getPrimerNombre(nombre?: string | null, email?: string | null): string {
  if (nombre) return nombre.trim().split(/\s+/)[0];
  return email ? email.split('@')[0] : '';
}

// fotos placeholder temporales por categoría (Pexels), hasta que exista el bucket de fotos real
const fotoPorCategoria: Record<string, string> = {
  'Electrodomésticos': 'https://images.pexels.com/photos/30946798/pexels-photo-30946798.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Muebles y colchones': 'https://images.pexels.com/photos/6580377/pexels-photo-6580377.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Ropa y calzado': 'https://images.pexels.com/photos/15398044/pexels-photo-15398044.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Bebés e infancia': 'https://images.pexels.com/photos/27086424/pexels-photo-27086424.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Tecnología': 'https://images.pexels.com/photos/6893890/pexels-photo-6893890.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Educación y libros': 'https://images.pexels.com/photos/8045884/pexels-photo-8045884.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Salud y movilidad': 'https://images.pexels.com/photos/8543045/pexels-photo-8543045.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Herramientas y construcción': 'https://images.pexels.com/photos/6263062/pexels-photo-6263062.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Hogar y menaje': 'https://images.pexels.com/photos/8286625/pexels-photo-8286625.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Transporte': 'https://images.pexels.com/photos/36546545/pexels-photo-36546545.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Otros': 'https://images.pexels.com/photos/11200117/pexels-photo-11200117.jpeg?auto=compress&cs=tinysrgb&w=400',
};

function getFotoPlaceholder(publication: Publication): string {
  const nombreCategoria = publication.categorias?.nombre;
  if (nombreCategoria && fotoPorCategoria[nombreCategoria]) {
    return fotoPorCategoria[nombreCategoria];
  }
  return `https://picsum.photos/seed/${publication.id}/200/200`;
}

export function HomeFeed() {
  const { user } = useAuth();
  const nombreVisible = user?.user_metadata?.nombre_visible as string | undefined;
  const primerNombre = getPrimerNombre(nombreVisible, user?.email);

  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchFeed() {
      const { data, error } = await supabase
        .from('publicaciones')
        .select(
          'id, tipo, estado, titulo, descripcion, creada_en, vence_en, urgencia, estado_objeto, categorias(nombre), zonas(region, partido, localidad)'
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
              className="w-40 shrink-0 bg-tarjeta rounded-tarjeta border border-borde shadow-sm overflow-hidden"
            >
              {/* foto placeholder temporal por categoría, hasta que exista el bucket de fotos real */}
              <img
                src={getFotoPlaceholder(publication)}
                alt=""
                className="h-24 w-full object-cover bg-lienzo"
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
                <div className="flex flex-col items-start gap-1">
                  <Badge variant={tipoVariants[publication.tipo]} className="!text-[11px]">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
