import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useN8n } from '../hooks/useN8n';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Logo } from '../components/Logo';


export function Home() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { loading: testing, error: testError, data: testData, callWebhook } = useN8n();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
    navigate('/login');
  }

  async function testN8nCall() {
    const webhookUrl = 'https://webhook.site/unique-id-test';

    await callWebhook(
      webhookUrl,
      { test: true, timestamp: new Date().toISOString() },
      session
    );
  }

  return (
    <div className="min-h-screen bg-superficie p-8 flex items-center justify-center">
      <div className="text-center">
        <Logo size="md" />
        <p className="text-xl text-texto-medio">Plataforma de donaciones con matching asistido por IA</p>

        {user && (
          <div className="mt-8 p-4 bg-tarjeta rounded-tarjeta shadow-md">
            <p className="text-sm text-texto-suave mb-4">Autenticado como: {user.email}</p>

            <div className="flex gap-2 justify-center mb-4">
              <Button variant="outline" onClick={testN8nCall} disabled={testing}>
                {testing ? 'Testeando...' : 'Test n8n Call'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {testing && (
              <p className="text-sm text-texto-medio">⏳ Loading: Llamando a webhook de n8n...</p>
            )}
            {!testing && testError && (
              <p className="text-sm text-texto-medio">❌ Error: {testError.message}</p>
            )}
            {!testing && !testError && testData !== null && (
              <p className="text-sm text-texto-medio">
                ✅ Success: Webhook llamado correctamente. Verifica Network tab para ver Authorization: Bearer &lt;JWT&gt;
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
