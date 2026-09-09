-- ============================================
-- TABLA IMAGENES_PUBLICACION
-- ============================================
CREATE TABLE public.imagenes_publicacion (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id     uuid NOT NULL REFERENCES public.publicaciones(id) ON DELETE CASCADE,
    ruta_storage       text NOT NULL,
    orden              smallint NOT NULL CHECK (orden BETWEEN 0 AND 2),
    descripcion_ia     text,
    estado_descripcion text NOT NULL DEFAULT 'pendiente'
                       CHECK (estado_descripcion IN ('pendiente','lista','fallida')),
    creada_en          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (publicacion_id, orden)
);

ALTER TABLE public.imagenes_publicacion ENABLE ROW LEVEL SECURITY;

-- RLS: el dueño de la publicación (por join) escribe/borra; lectura para
-- el dueño siempre, o cualquier autenticado si la publicación está activa/en_proceso.
CREATE POLICY "Ver imagenes de publicaciones activas o propias"
  ON public.imagenes_publicacion
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.publicaciones p
      WHERE p.id = imagenes_publicacion.publicacion_id
      AND (p.estado IN ('activa', 'en_proceso') OR p.usuario_id = auth.uid())
    )
  );

CREATE POLICY "Insertar imagen en publicación propia"
  ON public.imagenes_publicacion
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.publicaciones p
      WHERE p.id = imagenes_publicacion.publicacion_id
      AND p.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Borrar imagen de publicación propia"
  ON public.imagenes_publicacion
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.publicaciones p
      WHERE p.id = imagenes_publicacion.publicacion_id
      AND p.usuario_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, DELETE ON public.imagenes_publicacion TO authenticated;

-- ============================================
-- BUCKET PRIVADO: publicaciones
-- ============================================
INSERT INTO storage.buckets (id, name, public)
   VALUES ('publicaciones', 'publicaciones', false)
   ON CONFLICT (id) DO UPDATE SET public = false;

-- ============================================
-- POLÍTICAS DE STORAGE (storage.objects)
-- Convención de ruta: {usuario_id}/{publicacion_id}/{orden}.jpg
-- ============================================
CREATE POLICY "Usuarios suben bajo su propio prefijo"
       ON storage.objects FOR INSERT
       TO authenticated
       WITH CHECK (
         bucket_id = 'publicaciones' AND
         (storage.foldername(name))[1] = auth.uid()::text
       );

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

CREATE POLICY "Propietario elimina sus archivos de Storage"
       ON storage.objects FOR DELETE
       TO authenticated
       USING (
         bucket_id = 'publicaciones' AND
         (storage.foldername(name))[1] = auth.uid()::text
       );
       
-- ============================================
-- ARREGLOS DE ESQUEMA
-- ============================================
-- (a) Los dos índices que el ADR-0002 § 2 declara y la migración inicial no creó.
   --     El primero es, textual, «exactamente el barrido que hace el motor en cada disparo».
   CREATE INDEX idx_publicaciones_barrido ON public.publicaciones (tipo, estado, vence_en);
   CREATE INDEX idx_publicaciones_usuario ON public.publicaciones (usuario_id);

   -- (b) `actualizada_en` quedó nullable y sin default; el contrato la pide NOT NULL.
   --     Hoy está en NULL en todas las filas, y H3-A.2 CA-7 exige que toda transición la escriba.
   UPDATE public.publicaciones SET actualizada_en = creada_en WHERE actualizada_en IS NULL;
   ALTER TABLE public.publicaciones ALTER COLUMN actualizada_en SET DEFAULT now();
   ALTER TABLE public.publicaciones ALTER COLUMN actualizada_en SET NOT NULL;
