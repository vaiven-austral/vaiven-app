import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PublicationDetailModal } from '@/components/publications/PublicationDetailModal';
import { TarjetaEleccionRecibida } from '@/components/matching/TarjetaEleccionRecibida';
import { useAuth } from '@/hooks/useAuth';
import { rutaContacto } from '@/lib/eleccion';
import { fetchEleccionesRecibidas, type EleccionesRecibidas } from '@/lib/eleccionesRecibidas';
import type { Publication } from '@/lib/publicationBadges';

// La lista de las donaciones cuyo dueño eligió esta necesidad. Sale de `matches`:
// no llama al motor ni escribe en ninguna tabla. Quien la ve tiene que ser la
// dueña de la necesidad; para cualquier otra, la lib no pide las filas.
export function QuienesTeEligieronPage() {
  const { necesidadId } = useParams<{ necesidadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [resultado, setResultado] = useState<EleccionesRecibidas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [donacionParaDetalle, setDonacionParaDetalle] = useState<Publication | null>(null);

  useEffect(() => {
    if (!necesidadId || !userId) return;

    let cancelled = false;

    async function cargar() {
      setLoading(true);
      setError(false);
      try {
        const datos = await fetchEleccionesRecibidas(necesidadId!, userId!);
        if (cancelled) return;
        setResultado(datos);
      } catch (err) {
        console.error('Error al cargar quiénes te eligieron:', err);
        if (cancelled) return;
        setError(true);
      }
      setLoading(false);
    }

    cargar();
    return () => {
      cancelled = true;
    };
  }, [necesidadId, userId, intento]);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-800 text-tinta">Quiénes te eligieron</h1>
        {!loading && !error && resultado?.tipo === 'ok' && (
          <p className="mt-1 text-texto-medio">{resultado.tituloNecesidad}</p>
        )}
      </div>

      {loading && <p className="text-texto-medio">Cargando...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-critico">No pudimos cargar quiénes te eligieron. Probá de nuevo.</p>
          <Button variant="outline" size="sm" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && resultado?.tipo === 'no_es_tuya' && (
        <EmptyState
          title="Esta publicación no existe o no es tuya."
          actionLabel="Volver al inicio"
          actionTo="/feed"
        />
      )}

      {!loading && !error && resultado?.tipo === 'ok' && resultado.elecciones.length === 0 && (
        <EmptyState
          title="Todavía nadie eligió esta necesidad"
          description="Cuando alguien la elija, la vas a ver acá."
          actionLabel="Volver"
          onAction={() => navigate(-1)}
        />
      )}

      {!loading && !error && resultado?.tipo === 'ok' && resultado.elecciones.length > 0 && (
        <>
          <p className="text-sm text-texto-medio">
            <span className="font-600 text-tinta">
              {resultado.elecciones.length}{' '}
              {resultado.elecciones.length === 1 ? 'persona eligió' : 'personas eligieron'}
            </span>{' '}
            esta necesidad
          </p>
          <div className="grid grid-cols-1 gap-4">
            {resultado.elecciones.map((eleccion) => (
              <TarjetaEleccionRecibida
                key={eleccion.id}
                donacion={eleccion.donacion}
                onVerDetalle={setDonacionParaDetalle}
                onVerContacto={(donacionId) => navigate(rutaContacto(donacionId))}
              />
            ))}
          </div>
        </>
      )}

      {donacionParaDetalle && (
        <PublicationDetailModal
          publication={donacionParaDetalle}
          onClose={() => setDonacionParaDetalle(null)}
        />
      )}
    </div>
  );
}
