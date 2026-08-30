import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  // Si ya hay sesión activa, redirige a home
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  // Mientras AuthContext carga, muestra spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">⟳</div>
      </div>
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-superficie">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tinta mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-critico/10 border border-critico rounded-boton text-critico text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            isLoading={submitting}
            className="w-full"
          >
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="text-center text-texto-suave mt-6">
          ¿No tienes cuenta? <a href="/registro" className="text-primario font-medium hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  );
}
