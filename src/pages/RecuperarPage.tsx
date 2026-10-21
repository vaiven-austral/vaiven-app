import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';
import { EMAIL_MAX_LENGTH } from '../lib/authLimits';

type Estado = 'idle' | 'enviado' | 'error';

export function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado('idle');
    setSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    });

    setSubmitting(false);
    if (error) {
      console.error('Error al pedir el link de recuperación:', error);
      setEstado('error');
      return;
    }
    // Mismo mensaje exista o no la cuenta: la pantalla no revela si un email está registrado.
    setEstado('enviado');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-superficie">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <h1 className="text-xl font-800 text-tinta mb-2">Recuperar contraseña</h1>

        {estado === 'enviado' ? (
          <div className="p-3 bg-exito/10 border border-exito rounded-boton text-exito text-sm">
            Si el email tiene una cuenta, te mandamos un link para elegir una contraseña nueva.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-texto-medio">
              Escribí tu email y te mandamos un link para elegir una contraseña nueva.
            </p>

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

            {estado === 'error' && (
              <div className="p-3 bg-critico/10 border border-critico rounded-boton text-critico text-sm">
                No pudimos procesar el pedido. Probá de nuevo en unos minutos.
              </div>
            )}

            <Button type="submit" disabled={submitting} isLoading={submitting} className="w-full">
              {submitting ? 'Enviando...' : 'Enviar link'}
            </Button>
          </form>
        )}

        <p className="text-center text-texto-suave mt-6">
          <Link to="/login" className="text-primario font-medium hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
