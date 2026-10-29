-- public.elegir_candidato: único camino para crear un match desde la app.
-- Pasa la donación a en_proceso y crea la fila de matches en el mismo paso;
-- si el insert falla, la transacción deshace el update solo.
CREATE OR REPLACE FUNCTION public.elegir_candidato(p_donacion_id uuid, p_necesidad_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_match_id uuid;
  v_rows int;
BEGIN
  -- 1. Reintento del mismo par: sólo lo corta el dueño de la donación.
  SELECT id INTO v_match_id
  FROM matches
  WHERE donacion_id = p_donacion_id AND necesidad_id = p_necesidad_id;

  IF v_match_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM publicaciones
    WHERE id = p_donacion_id AND tipo = 'donacion' AND usuario_id = auth.uid()
  ) THEN
    RETURN v_match_id;
  END IF;

  -- 2. Validar la necesidad: existe, es de tipo necesidad, activa, no vencida, no es de quien llama.
  IF NOT EXISTS (
    SELECT 1 FROM publicaciones
    WHERE id = p_necesidad_id
      AND tipo = 'necesidad'
      AND estado = 'activa'
      AND vence_en > now()
      AND usuario_id <> auth.uid()
  ) THEN
    RAISE EXCEPTION 'La necesidad no está disponible';
  END IF;

  -- 3. El candado: único update, con el where que decide todo. Una segunda llamada
  --    concurrente espera el lock de fila, reevalúa el where y ya no encuentra la
  --    donación activa.
  UPDATE publicaciones
  SET estado = 'en_proceso'
  WHERE id = p_donacion_id
    AND tipo = 'donacion'
    AND usuario_id = auth.uid()
    AND estado = 'activa'
    AND vence_en > now();

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows = 0 THEN
    -- 4. Puede que la llamada concurrente del mismo dueño ya haya ganado: se le
    --    devuelve su id. Si el match es de otro par o no existe, falla.
    SELECT id INTO v_match_id
    FROM matches
    WHERE donacion_id = p_donacion_id AND necesidad_id = p_necesidad_id;

    IF v_match_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM publicaciones
      WHERE id = p_donacion_id AND tipo = 'donacion' AND usuario_id = auth.uid()
    ) THEN
      RETURN v_match_id;
    END IF;

    RAISE EXCEPTION 'La donación no está activa o no es tuya';
  END IF;

  -- 5. Crear el match. Va después del update: la política de matches exige la
  --    donación ya en_proceso.
  INSERT INTO matches (donacion_id, necesidad_id)
  VALUES (p_donacion_id, p_necesidad_id)
  RETURNING id INTO v_match_id;

  RETURN v_match_id;
END;
$$;

REVOKE ALL ON FUNCTION public.elegir_candidato(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.elegir_candidato(uuid, uuid) TO authenticated;
