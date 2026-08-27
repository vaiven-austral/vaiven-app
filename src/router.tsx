import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Feed } from './pages/Feed';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/feed',
    element: <Feed />,
  },
  {
    path: '/dev/components',
    element: <ComponentShowcase />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
