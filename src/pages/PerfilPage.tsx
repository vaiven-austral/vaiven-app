import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ChevronRight, LogOut } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useOwnProfile } from '../hooks/useOwnProfile';
import { useZonaLabel } from '../hooks/useZonaLabel';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import { usePublicationsSummary } from '../hooks/usePublicationsSummary';
import { formatTipoBreakdown } from '../lib/publicationsSummary';
import { getProfileCompleteness } from '../lib/profileCompleteness';
import { getInitials } from '../lib/userDisplay';

const FORMATO_MES = new Intl.DateTimeFormat('es-AR', { month: 'long' });

function formatMiembroDesde(fecha: Date): string {
  return `${FORMATO_MES.format(fecha)} ${fecha.getFullYear()}`;
}

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, cerrarSesion } = useAuth();
  const { profile, loading: profileLoading } = useOwnProfile();
  const { label: zonaLabel } = useZonaLabel(profile?.zona_id ?? null);
  const { url: avatarUrl } = useAvatarUrl(profile?.avatar_ruta ?? null);
  const { summary } = usePublicationsSummary();

  const [cerrando, setCerrando] = useState(false);

  async function handleLogout(alcance: 'local' | 'global') {
    setCerrando(true);
    const cerro = await cerrarSesion(alcance);
    // Si el global falló, este dispositivo salió igual pero los otros no: el
    // login lo avisa. En el local no hace falta, se pidió salir de acá.
    navigate(
      '/login',
      alcance === 'global' && !cerro ? { state: { motivo: 'cierre-global-fallido' } } : undefined
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-800 text-tinta mb-6">Perfil</h1>
        {!profileLoading && (
          <p className="text-texto-suave text-sm">No se pudo cargar tu perfil.</p>
        )}
      </div>
    );
  }

  const initials = getInitials(profile.nombre_visible, user?.email);
  const miembroDesde = formatMiembroDesde(new Date(profile.creado_en));
  const completeness = getProfileCompleteness(profile);

  return (
    <div className="p-4 pb-12 space-y-4">
      {/* Identidad */}
      <div className="bg-tarjeta rounded-tarjeta border border-borde p-6 shadow-sm flex flex-col items-center text-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-28 w-28 rounded-pill object-cover" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-pill bg-secundario font-700 text-3xl text-tarjeta">
            {initials}
          </div>
        )}

        <p className="font-800 text-xl text-tinta mt-3">{profile.nombre_visible}</p>

        {zonaLabel && (
          <p className="flex items-center gap-1 text-texto-medio text-sm mt-1">
            <Icon icon={MapPin} className="h-4 w-4" />
            {zonaLabel}
          </p>
        )}

        <p className="text-texto-suave text-sm mt-1">Miembro desde {miembroDesde}</p>
      </div>

      {/* Resumen de publicaciones */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm">
          <p className="font-700 text-texto-suave text-xs uppercase">Activas</p>
          <p className="font-800 text-3xl text-primario mt-1">{summary.activas.total}</p>
          <p className="text-texto-medio text-sm mt-1">{formatTipoBreakdown(summary.activas.porTipo)}</p>
        </div>
        <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm">
          <p className="font-700 text-texto-suave text-xs uppercase">Completadas</p>
          <p className="font-800 text-3xl text-primario mt-1">{summary.completadas.total}</p>
          <p className="text-texto-medio text-sm mt-1">{formatTipoBreakdown(summary.completadas.porTipo)}</p>
        </div>
      </div>

      {/* Perfil completo */}
      <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm">
        <p className="font-700 text-texto-suave text-xs uppercase">Perfil completo</p>
        <p className="font-800 text-3xl text-primario mt-1">{completeness.percent}%</p>
        <div className="h-2 rounded-pill bg-lienzo mt-3 overflow-hidden">
          <div
            className="h-full rounded-pill bg-gradient-to-r from-primario to-secundario"
            style={{ width: `${completeness.percent}%` }}
          />
        </div>
        <p className="text-texto-medio text-sm mt-2">{completeness.message}</p>
        {completeness.percent < 100 && (
          <Link to="/perfil/editar" className="inline-block font-600 text-primario text-sm mt-1">
            Completar perfil →
          </Link>
        )}
      </div>

      {/* Menú */}
      <div className="bg-tarjeta rounded-tarjeta border border-borde shadow-sm overflow-hidden">
        <Link
          to="/perfil/editar"
          className="flex items-center justify-between px-4 py-3 hover:bg-lienzo transition-colors"
        >
          <div>
            <p className="font-600 text-tinta">Editar perfil</p>
            <p className="text-texto-suave text-sm">Nombre, foto y zona</p>
          </div>
          <Icon icon={ChevronRight} className="h-5 w-5 text-texto-suave shrink-0" />
        </Link>
      </div>

      {/* Cierre de sesión: éste dispositivo, o todos */}
      <Button
        type="button"
        variant="outline"
        className="w-full !border-borde-fuerte !text-tinta hover:bg-lienzo"
        disabled={cerrando}
        onClick={() => handleLogout('local')}
      >
        <Icon icon={LogOut} className="h-4 w-4 mr-2" />
        Cerrar sesión
      </Button>

      <div className="text-center">
        <button
          type="button"
          disabled={cerrando}
          onClick={() => handleLogout('global')}
          className="font-600 text-critico disabled:opacity-50"
        >
          Cerrar sesión en todos los dispositivos
        </button>
        <p className="text-texto-suave text-sm mt-2">
          También se cierra en el celular, la compu o cualquier otro lugar donde hayas entrado.
        </p>
      </div>
    </div>
  );
}
