import { useContext } from 'react';
import { AuthContext } from '../contexts/auth';

// Perfil propio, cargado una sola vez en AuthProvider y compartido por toda la app
export function useOwnProfile() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useOwnProfile debe usarse dentro de AuthProvider');
  }
  return {
    profile: context.profile,
    loading: context.profileLoading,
    refetch: context.refetchProfile,
  };
}
