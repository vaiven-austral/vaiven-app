import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import {
  enlaceDeContacto,
  fetchContactoDelMatch,
  type ContactoDelMatch,
} from '@/lib/contactoDelMatch';
import { PUBLICACION_CERRADA } from '@/lib/misMatches';

// Lee el match y el contacto de la otra persona de la base: recargada o abierta
// directo, muestra lo mismo. Lo que la base no devuelve no existe para este
// usuario, así que no se decide ni se esconde nada acá.
export function ContactoPage() {
  const { donacionId } = useParams<{ donacionId: string }>();
  const { user } = useAuth();
  const userId = user?.id;

  const [resultado, setResultado] = useState<ContactoDelMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!donacionId || !userId) return;

    let cancelled = false;

    async function cargar() {
      setLoading(true);
      setError(false);
      try {
        const datos = await fetchContactoDelMatch(donacionId!, userId!);
        if (cancelled) return;
        setResultado(datos);
      } catch (err) {
        console.error('Error al cargar el contacto:', err);
        if (cancelled) return;
        setError(true);
      }
      setLoading(false);
    }

    cargar();
    return () => {
      cancelled = true;
    };
  }, [donacionId, userId, intento]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-800 text-tinta">Contacto</h1>

      {loading && <p className="text-texto-medio">Cargando...</p>}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-critico">No pudimos cargar el contacto. Probá de nuevo.</p>
          <Button variant="outline" size="sm" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && resultado?.tipo === 'sin_match' && (
        <EmptyState
          icon={<Icon icon={UserRound} className="w-8 h-8" strokeWidth={1.9} />}
          title="No hay un match para esta donación."
          actionLabel="Volver al inicio"
          actionTo="/feed"
        />
      )}

      {!loading && !error && resultado?.tipo === 'match' && (
        <>
          <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm space-y-3">
            <div>
              <p className="font-700 text-texto-suave text-xs uppercase">Donación</p>
              <p className="font-600 text-tinta">
                {resultado.match.donacion?.titulo ?? PUBLICACION_CERRADA}
              </p>
            </div>
            <div>
              <p className="font-700 text-texto-suave text-xs uppercase">Necesidad</p>
              <p className="font-600 text-tinta">
                {resultado.match.necesidad?.titulo ?? PUBLICACION_CERRADA}
              </p>
            </div>
          </div>

          <TarjetaContacto resultado={resultado} />
        </>
      )}
    </div>
  );
}

// La tarjeta con el contacto de la otra persona, o el motivo por el que no está.
function TarjetaContacto({
  resultado,
}: {
  resultado: Extract<ContactoDelMatch, { tipo: 'match' }>;
}) {
  const titulo = resultado.rol === 'Donás' ? 'Contacto de quien recibe' : 'Contacto de quien dona';
  const enlace = resultado.contacto ? enlaceDeContacto(resultado.contacto) : null;

  return (
    <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm space-y-2">
      <p className="font-700 text-texto-suave text-xs uppercase">{titulo}</p>

      {resultado.otraCerrada ? (
        <p className="text-texto-medio">El contacto ya no está disponible.</p>
      ) : enlace ? (
        <p className="text-tinta">
          <span className="font-600">{enlace.medio}: </span>
          <a
            href={enlace.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primario font-600 underline"
          >
            {enlace.dato}
          </a>
        </p>
      ) : (
        <p className="text-texto-medio">Esta persona todavía no cargó su contacto.</p>
      )}
    </div>
  );
}
