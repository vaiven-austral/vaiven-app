-- Segunda política de SELECT sobre contactos: la contraparte de un match también
-- puede leerlo. Se suma a "Dueño lee su contacto" (Postgres combina políticas
-- permisivas del mismo comando con OR); esa política no se toca.
--
-- No es security definer: el join contra publicaciones queda sujeto a su propia
-- RLS, así que una publicación ajena completada no se ve tampoco desde acá — el
-- límite de permisos.md sale solo, sin repetirlo acá.
CREATE POLICY "Contraparte de un match lee el contacto"
  ON public.contactos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      JOIN public.publicaciones donacion ON donacion.id = m.donacion_id
      JOIN public.publicaciones necesidad ON necesidad.id = m.necesidad_id
      WHERE (donacion.usuario_id = auth.uid() AND necesidad.usuario_id = contactos.usuario_id)
         OR (necesidad.usuario_id = auth.uid() AND donacion.usuario_id = contactos.usuario_id)
    )
  );
