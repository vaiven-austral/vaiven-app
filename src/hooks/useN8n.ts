import { useCallback, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

interface UseN8nState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useN8n<T>() {
  const [state, setState] = useState<UseN8nState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const callWebhook = useCallback(
    async (webhookUrl: string, payload: unknown, session: Session | null) => {
      setState({ data: null, error: null, loading: true });

      try {
        if (!session?.access_token) {
          throw new Error('No hay sesión activa para realizar esta acción');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        let response: Response;
        try {
          response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error(`n8n webhook error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as T;
        setState({ data, error: null, loading: false });
        return { data, error: null };
      } catch (error) {
        const normalizedError = error instanceof Error
          ? (error.name === 'AbortError'
            ? new Error('El webhook de n8n no respondió a tiempo (timeout de 10s)')
            : error)
          : new Error('Unknown error');
        setState({ data: null, error: normalizedError, loading: false });
        return { data: null, error: normalizedError };
      }
    },
    []
  );

  return { ...state, callWebhook };
}
