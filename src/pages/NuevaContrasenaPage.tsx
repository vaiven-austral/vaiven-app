import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';
import { SplashScreen } from '../components/ui/SplashScreen';
import { PASSWORD_MAX_LENGTH, validarContrasenaNueva } from '../lib/authLimits';

// El formulario se muestra sólo con la sesión de recuperación que trae el link
// del correo (enRecuperacion), aunque haya otra sesión común abierta.
export function NuevaContrasenaPage() {
  const navigate = useNavigate();
  const { loading, enRecuperacion } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <SplashScreen />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errorValidacion = validarContrasenaNueva(password, confirmacion);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setError('');
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      console.error('Error al cambiar la contraseña:', error);
      setError(
        error.code === 'same_password'
          ? 'La contraseña nueva tiene que ser distinta de la anterior'
          : 'No pudimos cambiar la contraseña. Probá de nuevo.'
      );
      return;
    }
    navigate('/feed');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-superficie">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        {!enRecuperacion ? (
          <div className="text-center space-y-4">
            <h1 className="text-xl font-800 text-tinta">El link venció. Pedí uno nuevo</h1>
            <Link to="/recuperar" className="inline-block text-primario font-medium hover:underline">
              Pedir un link nuevo
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-xl font-800 text-tinta">Elegí tu contraseña nueva</h1>

            <div>
              <label className="block text-sm font-medium text-tinta mb-2">Contraseña nueva</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
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

            <div>
              <label className="block text-sm font-medium text-tinta mb-2">Repetí la contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmacion}
                onChange={(e) => { setConfirmacion(e.target.value); setError(''); }}
                required
                maxLength={PASSWORD_MAX_LENGTH}
                className="w-full px-4 py-2 border border-borde rounded-boton focus:outline-none focus:ring-2 focus:ring-primario"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-critico/10 border border-critico rounded-boton text-critico text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} isLoading={submitting} className="w-full">
              {submitting ? 'Guardando...' : 'Guardar contraseña'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
