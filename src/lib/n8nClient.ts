import type { Session } from '@supabase/supabase-js';

interface CallN8nResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export async function callN8nWebhook<T>(
  webhookUrl: string,
  payload: unknown,
  session: Session | null
): Promise<CallN8nResponse<T>> {
  try {
    if (!session?.access_token) {
      throw new Error('No hay sesión activa para realizar esta acción');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as T;
    return { data, error: null, loading: false };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
      loading: false,
    };
  }
}
