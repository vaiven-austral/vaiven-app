import { useAuth } from '../../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">⟳</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
