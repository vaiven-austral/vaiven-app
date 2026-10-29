-- ============================================================
-- MIGRACIÓN: matches, contactos y categorias_interes en perfiles
-- ============================================================

-- 1. Categorías de interés en perfiles
ALTER TABLE public.perfiles
  ADD COLUMN categorias_interes smallint[] NOT NULL DEFAULT '{}';

-- 2. Tabla contactos
CREATE TABLE public.contactos (
  usuario_id uuid PRIMARY KEY REFERENCES public.perfiles(id) ON DELETE CASCADE,
  telefono text,
  email_contacto text,
  medio_preferido text CHECK (medio_preferido IN ('whatsapp', 'telefono', 'email')),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- RLS contactos
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dueño lee su contacto"
  ON public.contactos
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Dueño inserta su contacto"
  ON public.contactos
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Dueño actualiza su contacto"
  ON public.contactos
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.contactos TO authenticated;


-- 3. Tabla matches
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donacion_id uuid NOT NULL REFERENCES public.publicaciones(id) ON DELETE CASCADE,
  necesidad_id uuid NOT NULL REFERENCES public.publicaciones(id) ON DELETE CASCADE,
  creado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_donacion_id_key UNIQUE (donacion_id)
);

-- RLS matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes leen el match"
  ON public.matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = matches.donacion_id
        AND publicaciones.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = matches.necesidad_id
        AND publicaciones.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Dueño de donacion en proceso inserta match con necesidad"
  ON public.matches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = matches.donacion_id
        AND publicaciones.usuario_id = auth.uid()
        AND publicaciones.tipo = 'donacion'
        AND publicaciones.estado = 'en_proceso'
    )
    AND EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = matches.necesidad_id
        AND publicaciones.tipo = 'necesidad'
        AND publicaciones.usuario_id <> auth.uid()
    )
  );

GRANT SELECT, INSERT ON public.matches TO authenticated;
