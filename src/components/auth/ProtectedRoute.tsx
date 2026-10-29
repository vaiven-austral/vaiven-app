import { useAuth } from '../../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { session, loading, sesionVencida } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">⟳</div>
      </div>
    );
  }

  if (!session) {
    // El aviso sólo si la sesión se perdió sola: entrar sin haber tenido sesión,
    // o cerrarla a propósito, llega a /login sin estado.
    return (
      <Navigate to="/login" replace state={sesionVencida ? { motivo: 'sesion-vencida' } : undefined} />
    );
  }

  return <Outlet />;
}
