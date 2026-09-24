-- ============================================
-- TABLA JUICIOS
-- ============================================
CREATE TABLE public.juicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donacion_id UUID NOT NULL REFERENCES public.publicaciones(id),
    necesidad_id UUID NOT NULL REFERENCES public.publicaciones(id),
    nivel SMALLINT NOT NULL CHECK (nivel BETWEEN 0 AND 4),
    justificacion JSONB NOT NULL,
    version_scoring TEXT NOT NULL,
    modelo TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT juicios_par_unico UNIQUE (donacion_id, necesidad_id)
);

CREATE INDEX juicios_necesidad_id_idx ON public.juicios (necesidad_id);

-- RLS
ALTER TABLE public.juicios ENABLE ROW LEVEL SECURITY;

-- El dueño de cualquiera de las dos publicaciones del par lee el juicio, desde los dos lados.
CREATE POLICY "Ver juicio de un par propio"
  ON public.juicios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = juicios.donacion_id
        AND publicaciones.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.publicaciones
      WHERE publicaciones.id = juicios.necesidad_id
        AND publicaciones.usuario_id = auth.uid()
    )
  );

GRANT SELECT ON public.juicios TO authenticated;

-- Ningún usuario de la app escribe en juicios: sólo el motor, con su propio rol.

-- ROL DEL MOTOR: motor_matching
CREATE ROLE motor_matching NOLOGIN NOINHERIT NOBYPASSRLS;

GRANT motor_matching TO authenticator;

-- Lee publicaciones activas, nada más.
GRANT SELECT ON public.publicaciones TO motor_matching;

CREATE POLICY "Motor lee publicaciones activas"
  ON public.publicaciones
  FOR SELECT
  TO motor_matching
  USING (estado = 'activa');

-- Lee categorías, para el nombre que recibe el modelo.
GRANT SELECT ON public.categorias TO motor_matching;

CREATE POLICY "Motor lee categorias"
  ON public.categorias
  FOR SELECT
  TO motor_matching
  USING (true);

-- Inserta y actualiza juicios (el update lo pide el upsert por (donacion_id, necesidad_id)).
GRANT INSERT, UPDATE ON public.juicios TO motor_matching;

CREATE POLICY "Motor inserta juicios"
  ON public.juicios
  FOR INSERT
  TO motor_matching
  WITH CHECK (true);

CREATE POLICY "Motor actualiza juicios"
  ON public.juicios
  FOR UPDATE
  TO motor_matching
  USING (true)
  WITH CHECK (true);

