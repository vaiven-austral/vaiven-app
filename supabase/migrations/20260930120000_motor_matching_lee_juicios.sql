-- ============================================
-- motor_matching PUEDE LEER juicios
-- ============================================
-- El webhook motor-juicio necesita excluir, antes de llamar al modelo, los
-- pares que ya tienen fila en juicios (por donacion_id o por necesidad_id).
-- La política de usuarios ("Ver juicio de un par propio") no se toca: sigue
-- acotada a los pares donde el usuario es dueño de alguna de las dos puntas.
-- Ésta es una política propia del rol del motor, sin esa restricción, porque
-- el motor no está viendo "sus" publicaciones sino decidiendo qué le falta
-- juzgar.

GRANT SELECT ON public.juicios TO motor_matching;

CREATE POLICY "Motor lee juicios"
  ON public.juicios
  FOR SELECT
  TO motor_matching
  USING (true);
