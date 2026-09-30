import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOwnProfile } from '../hooks/useOwnProfile';
import { useZonaLabel } from '../hooks/useZonaLabel';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import { usePublicationsSummary } from '../hooks/usePublicationsSummary';
import { formatTipoBreakdown } from '../lib/publicationsSummary';
import { getProfileCompleteness } from '../lib/profileCompleteness';
import { supabase } from '../lib/supabaseClient';
import { getInitials } from '../lib/userDisplay';

const FORMATO_MES = new Intl.DateTimeFormat('es-AR', { month: 'long' });

function formatMiembroDesde(fecha: Date): string {
  return `${FORMATO_MES.format(fecha)} ${fecha.getFullYear()}`;
}

export function PerfilPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useOwnProfile();
  const { label: zonaLabel } = useZonaLabel(profile?.zona_id ?? null);
  const { url: avatarUrl } = useAvatarUrl(profile?.avatar_ruta ?? null);
  const { summary } = usePublicationsSummary();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
    navigate('/login');
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
    <div className="p-4 space-y-4">
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
            <MapPin className="h-4 w-4" />
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
          <ChevronRight className="h-5 w-5 text-texto-suave shrink-0" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 border-t border-borde font-600 text-tinta hover:bg-lienzo transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
