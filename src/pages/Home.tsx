import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { callN8nWebhook } from '../lib/n8nClient';

export function Home() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  async function testN8nCall() {
    setTesting(true);
    setTestResult('⏳ Loading: Llamando a webhook de n8n...');

    const webhookUrl = 'https://webhook.site/unique-id-test';

    const result = await callN8nWebhook(
      webhookUrl,
      { test: true, timestamp: new Date().toISOString() },
      session
    );

    if (result.error) {
      setTestResult(`❌ Error: ${result.error.message}`);
    } else {
      setTestResult(`✅ Success: Webhook llamado correctamente. Verifica Network tab para ver Authorization: Bearer <JWT>`);
    }
    setTesting(false);
  }

  return (
    <div className="min-h-screen bg-superficie p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-800 text-tinta mb-4">VaiVén</h1>
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

            {testResult && (
              <p className="text-sm text-texto-medio">{testResult}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
