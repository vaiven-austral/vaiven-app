import { supabase } from './supabaseClient';

export interface Candidate {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'donacion' | 'necesidad';
  categoria_id: number;
  zona_id: number;
  estado_objeto?: string;
  urgencia?: string;
  cantidad: number;
  usuario_id: string;
  vence_en: string;
  perfiles?: {
    zona_id: number | null;
    avatar_ruta: string | null;
  };
  zonas?: {
    id: number;
    region: string;
    partido: string;
    localidad: string;
  };
  nivel: 0 | 1 | 2 | 3 | 4 | null;
  version_scoring: string | null;
  analizando: boolean;
  score_total: number | null;
  factores: {
    f1_resolucion: number | null;
    f2_urgencia: number;
    f3_proximidad: number;
    f4_confianza: number;
    f5_calidad: number;
    f6_categoria: number;
  };
  justificacion: {
    narrativa: string;
    fortalezas: string[];
    consideraciones: string[];
  } | null;
}

export interface MatchingResponse {
  statusCode: number;
  body: {
    success: boolean;
    candidates: Candidate[];
    count: number;
  };
}

export async function callN8nWebhook(
  publicacionId: string
): Promise<Candidate[]> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('VITE_N8N_WEBHOOK_URL no está configurada');
  }

  const session = await supabase.auth.getSession();
  const jwt = session.data?.session?.access_token;

  if (!jwt) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      publicacion_id: publicacionId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.body?.message || `Error en webhook (${response.status})`
    );
  }

  const data: MatchingResponse = await response.json();

  if (!data.body?.success) {
    throw new Error('El webhook no devolvió candidatos válidos');
  }

  return data.body.candidates;
}
