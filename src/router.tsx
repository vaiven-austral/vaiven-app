import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { Home } from './pages/Home';
import { HomeFeed } from './pages/HomeFeed';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicarPage } from './pages/PublicarPage';
import { CreateDonation } from './pages/CreateDonation';
import { CreateNeed } from './pages/CreateNeed';
import { MyPublications } from './pages/MyPublications';
import { RankingIAPage } from './pages/RankingIAPage';
import { OfertasPage } from './pages/OfertasPage';
import { HistorialPage } from './pages/HistorialPage';
import { PerfilPage } from './pages/PerfilPage';
import { MatchingResultsPage } from './pages/MatchingResultsPage';
import { NotFoundPage } from './pages/NotFoundPage';
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
            element: <Navigate to="/feed" replace />,
          },
          {
            path: '/feed',
            element: <HomeFeed />,
          },
          {
            path: '/dev/home',
            element: <Home />,
          },
          {
            path: '/mis-donaciones',
            element: <MyPublications />,
          },
          {
            path: '/mis-necesidades',
            element: <MyPublications />,
          },
          {
            path: '/publicar',
            element: <PublicarPage />,
          },
          {
            path: '/publicar/donacion',
            element: <CreateDonation />,
          },
          {
            path: '/publicar/necesidad',
            element: <CreateNeed />,
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
          {
            path: '/matching/:publicacionId',
            element: <MatchingResultsPage />,
          },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
