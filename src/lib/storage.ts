import { supabase } from './supabaseClient';

const URL_FIRMADA_EXPIRA_SEGUNDOS = 60 * 60; // 1 hora

// El bucket "publicaciones" es privado (RLS en storage.objects), así que
// getPublicUrl no sirve acá: esa URL ignora RLS y solo funciona en buckets
// públicos. createSignedUrl sí respeta la policy de lectura (dueño, o
// cualquier autenticado si la publicación está activa/en_proceso).
export async function getPublicationImageUrl(rutaStorage: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('publicaciones')
    .createSignedUrl(rutaStorage, URL_FIRMADA_EXPIRA_SEGUNDOS);

  if (error || !data) return null;
  return data.signedUrl;
}
