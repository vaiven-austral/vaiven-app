import { useAuth } from '../../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import { SplashScreen } from '../ui/SplashScreen';

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
