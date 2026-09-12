import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { getInitials } from '../lib/userDisplay';
import { Button } from '../components/ui/button';

export function PerfilPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const nombreVisible = user?.user_metadata?.nombre_visible as string | undefined;
  const initials = getInitials(nombreVisible, user?.email);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
    navigate('/login');
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-6">Perfil</h1>

      <div className="bg-tarjeta rounded-tarjeta border border-borde p-4 shadow-sm mb-6 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-pill bg-secundario font-700 text-lg text-tarjeta">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-600 text-tinta truncate">{nombreVisible || 'Sin nombre'}</p>
          <p className="text-texto-suave text-sm truncate">{user?.email}</p>
        </div>
      </div>

      <Button variant="outline" onClick={handleLogout} className="w-full">
        Cerrar sesión
      </Button>
    </div>
  );
}
