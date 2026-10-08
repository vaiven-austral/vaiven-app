import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../lib/authLimits';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      window.location.href = '/feed';
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
              maxLength={EMAIL_MAX_LENGTH}
              className="w-full px-4 py-2 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={PASSWORD_MAX_LENGTH}
                className="w-full px-4 py-2 pr-11 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave hover:text-texto-medio"
              >
                {showPassword ? <Icon icon={EyeOff} size={18} /> : <Icon icon={Eye} size={18} />}
              </button>
            </div>
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
