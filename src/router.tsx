import { createBrowserRouter } from 'react-router-dom';
import { ComponentShowcase } from './pages/ComponentShowcase';

function Home() {
  return (
    <div className="min-h-screen bg-superficie p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-800 text-tinta mb-4">VaiVén</h1>
        <p className="text-xl text-texto-medio">Plataforma de donaciones con matching asistido por IA</p>
      </div>
    </div>
  );
}

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
