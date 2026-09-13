import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';

export function RegisterPage() {
  const [nombreVisible, setNombreVisible] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  function validateForm(): boolean {
    if (!nombreVisible.trim()) {
      setError('El nombre visible es requerido');
      return false;
    }
    if (!email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido');
      return false;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_visible: nombreVisible,
          },
        },
      });

      if (error) throw error;

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setSubmitting(false);
    }
  }

  const clearError = () => setError('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-superficie">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tinta mb-2">Nombre visible</label>
            <input
              type="text"
              value={nombreVisible}
              onChange={(e) => {
                setNombreVisible(e.target.value);
                clearError();
              }}
              className="w-full px-4 py-2 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
              placeholder="Tu nombre"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="w-full px-4 py-2 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
              placeholder="tu@email.com"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta mb-2">Contraseña (mínimo 8 caracteres)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className="w-full px-4 py-2 pr-11 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
                placeholder="••••••••"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave hover:text-texto-medio"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError();
                }}
                className="w-full px-4 py-2 pr-11 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
                placeholder="••••••••"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave hover:text-texto-medio"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            {submitting ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <p className="text-center text-texto-suave mt-6">
          ¿Ya tienes cuenta? <a href="/login" className="text-primario font-medium hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
