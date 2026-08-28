import { createBrowserRouter } from 'react-router-dom';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { Home } from './pages/Home';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicacionesPage } from './pages/PublicacionesPage';
import { PublicarDonacionPage } from './pages/PublicarDonacionPage';
import { PublicarNecesidadPage } from './pages/PublicarNecesidadPage';
import { HistorialPage } from './pages/HistorialPage';
import { PerfilPage } from './pages/PerfilPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  // Rutas públicas
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/registro',
    element: <RegisterPage />,
  },
  {
    path: '/dev/components',
    element: <ComponentShowcase />,
  },

  // Rutas protegidas
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/publicaciones',
        element: <PublicacionesPage />,
      },
      {
        path: '/publicar/donacion',
        element: <PublicarDonacionPage />,
      },
      {
        path: '/publicar/necesidad',
        element: <PublicarNecesidadPage />,
      },
      {
        path: '/historial',
        element: <HistorialPage />,
      },
      {
        path: '/perfil',
        element: <PerfilPage />,
      },
    ],
  },
]);
