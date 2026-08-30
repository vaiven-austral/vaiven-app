import { createBrowserRouter } from 'react-router-dom';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { Home } from './pages/Home';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicacionesPage } from './pages/PublicacionesPage';
import { PublicarPage } from './pages/PublicarPage';
import { PublicarDonacionPage } from './pages/PublicarDonacionPage';
import { PublicarNecesidadPage } from './pages/PublicarNecesidadPage';
import { MisDonacionesPage } from './pages/MisDonacionesPage';
import { MisNecesidadesPage } from './pages/MisNecesidadesPage';
import { RankingIAPage } from './pages/RankingIAPage';
import { OfertasPage } from './pages/OfertasPage';
import { HistorialPage } from './pages/HistorialPage';
import { PerfilPage } from './pages/PerfilPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

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
      // Rutas con Shell (Header + BottomNav) — las 9 pantallas principales
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
          {
            path: '/mis-donaciones',
            element: <MisDonacionesPage />,
          },
          {
            path: '/mis-necesidades',
            element: <MisNecesidadesPage />,
          },
          {
            path: '/publicar',
            element: <PublicarPage />,
          },
          {
            path: '/publicar/donacion',
            element: <PublicarDonacionPage />,
          },
          {
            path: '/ranking-ia',
            element: <RankingIAPage />,
          },
          {
            path: '/ofertas',
            element: <OfertasPage />,
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

      // Rutas protegidas sin Shell (fuera del alcance de este ticket)
      {
        path: '/publicaciones',
        element: <PublicacionesPage />,
      },
      {
        path: '/publicar/necesidad',
        element: <PublicarNecesidadPage />,
      },
    ],
  },
]);
