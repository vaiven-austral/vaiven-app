import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SplashScreen } from '../components/ui/SplashScreen';

export function RootPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return <Navigate to={session ? '/feed' : '/login'} replace />;
}
