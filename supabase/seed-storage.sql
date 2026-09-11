-- ============================================
-- POLÍTICAS DE STORAGE (storage.objects) — bucket "publicaciones"
-- Convención de ruta: {usuario_id}/{publicacion_id}/{orden}.jpg
-- ============================================
-- Este archivo NO es una migración: no lo aplica `supabase db reset` ni
-- `supabase start`. storage.objects lo crea el contenedor de Storage cuando
-- arranca, DESPUÉS de que el CLI termina de aplicar supabase/migrations/,
-- así que cualquier CREATE POLICY sobre storage.objects puesto en una
-- migración falla siempre en un reset local limpio (ver
-- 20260904005417_storage_bucket_publicaciones_rls.sql).
--
-- Correlo a mano una vez, después de que `supabase start` termine:
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed-storage.sql
--
-- El bucket también se crea acá (no en config.toml [storage.buckets.*]):
-- ese mecanismo hace que el CLI llame a la API de Storage para crearlo
-- durante el propio `supabase start`, y en este entorno esa llamada le
-- gana de mano a la sincronización interna del contenedor de Storage
-- ("DatabaseSchemaMismatch"), abortando todo el arranque. Insertarlo acá
-- por SQL, después de que el stack ya está arriba, evita esa carrera.
INSERT INTO storage.buckets (id, name, public)
   VALUES ('publicaciones', 'publicaciones', false)
   ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Usuarios suben bajo su propio prefijo" ON storage.objects;
CREATE POLICY "Usuarios suben bajo su propio prefijo"
       ON storage.objects FOR INSERT
       TO authenticated
       WITH CHECK (
         bucket_id = 'publicaciones' AND
         (storage.foldername(name))[1] = auth.uid()::text
       );

DROP POLICY IF EXISTS "Lectura autenticada de imagenes activas o propias" ON storage.objects;
CREATE POLICY "Lectura autenticada de imagenes activas o propias"
       ON storage.objects FOR SELECT
       TO authenticated
       USING (
         bucket_id = 'publicaciones' AND (
           (storage.foldername(name))[1] = auth.uid()::text
           OR EXISTS (
             SELECT 1 FROM public.publicaciones p
             WHERE p.id::text = (storage.foldername(name))[2]
             AND p.estado IN ('activa', 'en_proceso')
           )
         )
       );

DROP POLICY IF EXISTS "Propietario elimina sus archivos de Storage" ON storage.objects;
CREATE POLICY "Propietario elimina sus archivos de Storage"
       ON storage.objects FOR DELETE
       TO authenticated
       USING (
         bucket_id = 'publicaciones' AND
         (storage.foldername(name))[1] = auth.uid()::text
       );
