import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../lib/userDisplay';
import logoVaiVen from '../../assets/logoVaiVen.png';

export function Header() {
  const { user } = useAuth();
  const nombre = user?.user_metadata?.nombre_visible as string | undefined;
  const initials = getInitials(nombre, user?.email);

  return (
    <header className="flex h-14 items-center justify-between border-b border-borde bg-tarjeta px-4">
      <Link to="/feed">
        <img src={logoVaiVen} alt="VaiVen" className="h-9 w-auto" />
      </Link>

      <Link
        to="/perfil"
        className="flex h-10 w-10 items-center justify-center rounded-pill bg-secundario font-700 text-sm text-tarjeta"
      >
        {initials}
      </Link>
    </header>
  );
}
