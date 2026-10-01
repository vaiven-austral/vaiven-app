import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';
import { getInitials } from '../../lib/userDisplay';
import logoVaiVen from '../../assets/logoVaiVen.png';

export function Header() {
  const { user } = useAuth();
  const { profile } = useOwnProfile();
  const { url: avatarUrl } = useAvatarUrl(profile?.avatar_ruta ?? null);
  const initials = getInitials(profile?.nombre_visible, user?.email);

  return (
    <header className="flex h-14 items-center justify-between border-b border-borde bg-tarjeta px-4">
      <Link to="/feed">
        <img src={logoVaiVen} alt="VaiVen" className="h-9 w-auto" />
      </Link>

      <Link to="/perfil">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-10 w-10 rounded-pill object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-secundario font-700 text-sm text-tarjeta">
            {initials}
          </div>
        )}
      </Link>
    </header>
  );
}
