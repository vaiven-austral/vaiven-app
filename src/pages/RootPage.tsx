import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SplashScreen, useSplashScreen } from '../components/ui/SplashScreen';

export function RootPage() {
  const { session, loading } = useAuth();
  const showSplash = useSplashScreen(loading);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <Navigate to={session ? '/feed' : '/login'} replace />;
}
