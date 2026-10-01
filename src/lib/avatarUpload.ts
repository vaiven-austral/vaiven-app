import { supabase } from './supabaseClient';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Valida en el cliente antes de subir nada: JPG o PNG, hasta 5 MB.
export function validateAvatarFile(file: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return 'La foto tiene que ser JPG o PNG.';
  }
  if (file.size > MAX_BYTES) {
    return 'La foto no puede pesar más de 5 MB.';
  }
  return null;
}

interface SubirAvatarResult {
  rutaStorage: string | null;
  error: string | null;
}

// Nombre único (timestamp): .upload() usa la politica de INSERT de storage.objects
export async function subirAvatar(file: File, usuarioId: string): Promise<SubirAvatarResult> {
  const rutaStorage = `${usuarioId}/avatar-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('publicaciones')
    .upload(rutaStorage, file, { contentType: file.type });

  if (error) {
    return { rutaStorage: null, error: `No se pudo subir la foto: ${error.message}` };
  }

  return { rutaStorage, error: null };
}

// .remove() usa la politica DELETE de storage.objects
export async function borrarAvatar(rutaStorage: string): Promise<void> {
  const { error } = await supabase.storage.from('publicaciones').remove([rutaStorage]);
  if (error) {
    console.error('Error al borrar el avatar anterior:', error);
  }
}
