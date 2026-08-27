import { createBrowserRouter } from 'react-router-dom';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { Home } from './pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/dev/components',
    element: <ComponentShowcase />,
  },
]);
