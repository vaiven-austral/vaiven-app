import { supabase } from './supabaseClient';

const URL_FIRMADA_EXPIRA_SEGUNDOS = 60 * 60; // 1 hora

// cache en memoria para no repetir createSignedUrl al volver a una foto ya
// pedida (ej. navegando el carrusel); se corta unos minutos antes del TTL
// real para no arriesgar servir una URL vencida
const MARGEN_EXPIRACION_MS = 5 * 60 * 1000;
const cacheUrls = new Map<string, { url: string; expiraEn: number }>();

// El bucket "publicaciones" es privado (RLS en storage.objects), así que
// getPublicUrl no sirve acá: esa URL ignora RLS y solo funciona en buckets
// públicos. createSignedUrl sí respeta la policy de lectura (dueño, o
// cualquier autenticado si la publicación está activa/en_proceso).
export async function getPublicationImageUrl(rutaStorage: string): Promise<string | null> {
  const cacheado = cacheUrls.get(rutaStorage);
  if (cacheado && cacheado.expiraEn > Date.now()) return cacheado.url;

  const { data, error } = await supabase.storage
    .from('publicaciones')
    .createSignedUrl(rutaStorage, URL_FIRMADA_EXPIRA_SEGUNDOS);

  if (error || !data) return null;

  cacheUrls.set(rutaStorage, {
    url: data.signedUrl,
    expiraEn: Date.now() + URL_FIRMADA_EXPIRA_SEGUNDOS * 1000 - MARGEN_EXPIRACION_MS,
  });
  return data.signedUrl;
}
