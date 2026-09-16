import { supabase } from './supabaseClient';

export const MAX_IMAGENES_POR_PUBLICACION = 3;

// portada = imagen de menor orden, no necesariamente orden === 0 (p.ej. datos
// de seed o publicaciones con imágenes borradas pueden dejar gaps)
export function getPortada<T extends { orden: number }>(imagenes: T[] | null | undefined): T | undefined {
  return imagenes?.reduce<T | undefined>((menor, img) => (!menor || img.orden < menor.orden ? img : menor), undefined);
}

interface SubirImagenesResult {
  error: string | null;
}

// sube cada archivo a Storage y recién si eso sale bien inserta su fila en
// imagenes_publicacion — así nunca queda una fila sin su archivo real detrás.
// se corta en el primer error
export async function subirImagenesPublicacion(
  files: File[],
  usuarioId: string,
  publicacionId: string
): Promise<SubirImagenesResult> {
  for (let orden = 0; orden < files.length; orden++) {
    const file = files[orden];
    const rutaStorage = `${usuarioId}/${publicacionId}/${orden}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('publicaciones')
      .upload(rutaStorage, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      return { error: `No se pudo subir la foto ${orden + 1}: ${uploadError.message}` };
    }

    const { error: dbError } = await supabase.from('imagenes_publicacion').insert({
      publicacion_id: publicacionId,
      ruta_storage: rutaStorage,
      orden,
      estado_descripcion: 'pendiente',
      descripcion_ia: null,
    });

    if (dbError) {
      // el archivo se subió arriba; si no se registra, no lo dejamos
      // huérfano en Storage
      await supabase.storage.from('publicaciones').remove([rutaStorage]);
      return { error: `Se subió la foto ${orden + 1} pero no se pudo registrar: ${dbError.message}` };
    }
  }

  return { error: null };
}
