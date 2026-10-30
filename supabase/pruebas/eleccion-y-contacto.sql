-- Prueba automática: elegir un candidato no duplica el match, y el contacto
-- sólo lo lee la contraparte. Corre sólo contra la base local:
--   pnpm supabase db reset
--   docker exec -i supabase_db_vaiven-app psql -U postgres -v ON_ERROR_STOP=1 < supabase/pruebas/eleccion-y-contacto.sql
-- Usuarios e ids: supabase/seed.sql. No usa la clave secreta ni security definer:
-- lo que se prueba es lo que ve cada sesión.

BEGIN;

-- A: f3b6d105-625f-400e-8d1d-dd5a3d0364a0   B: ff3041a6-febe-4e85-925b-ae5216b73361
-- C: 78d026a5-c05c-4705-b32b-b518bd05bc3b
-- donación de B: b1111111-…   necesidad de A: a1111111-…   otra necesidad de A: a2222222-…

-- ============================================================
-- Caso 1: antes de elegir, nadie lee el contacto ajeno
-- ============================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ff3041a6-febe-4e85-925b-ae5216b73361","role":"authenticated"}', true);
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM contactos WHERE usuario_id = 'f3b6d105-625f-400e-8d1d-dd5a3d0364a0';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'caso 1 (B lee contacto de A, antes de elegir): esperaba 0 filas, dio %', v_count;
  END IF;
END $$;

SELECT set_config('request.jwt.claims', '{"sub":"f3b6d105-625f-400e-8d1d-dd5a3d0364a0","role":"authenticated"}', true);
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM contactos WHERE usuario_id = 'ff3041a6-febe-4e85-925b-ae5216b73361';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'caso 1 (A lee contacto de B, antes de elegir): esperaba 0 filas, dio %', v_count;
  END IF;
END $$;

-- ============================================================
-- Caso 6a: un tercero no lee, antes de elegir (C ya tiene su propio
-- match con E en la semilla: tener un match con otro no habilita nada)
-- ============================================================
SELECT set_config('request.jwt.claims', '{"sub":"78d026a5-c05c-4705-b32b-b518bd05bc3b","role":"authenticated"}', true);
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM contactos
   WHERE usuario_id IN ('f3b6d105-625f-400e-8d1d-dd5a3d0364a0', 'ff3041a6-febe-4e85-925b-ae5216b73361');
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'caso 6a (tercero C, antes de elegir): esperaba 0 filas, dio %', v_count;
  END IF;
END $$;

-- ============================================================
-- Caso 2: elección válida
-- ============================================================
SELECT set_config('request.jwt.claims', '{"sub":"ff3041a6-febe-4e85-925b-ae5216b73361","role":"authenticated"}', true);
DO $$
DECLARE v_id uuid;
BEGIN
  SELECT elegir_candidato('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111') INTO v_id;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'caso 2 (elección válida): esperaba un uuid, dio null';
  END IF;
  PERFORM set_config('prueba.match_id', v_id::text, true);
END $$;

RESET ROLE;
DO $$
DECLARE v_estado text; v_count int;
BEGIN
  SELECT estado INTO v_estado FROM publicaciones WHERE id = 'b1111111-1111-1111-1111-111111111111';
  IF v_estado <> 'en_proceso' THEN
    RAISE EXCEPTION 'caso 2 (elección válida): esperaba la donación en_proceso, quedó %', v_estado;
  END IF;
  SELECT count(*) INTO v_count FROM matches WHERE donacion_id = 'b1111111-1111-1111-1111-111111111111';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'caso 2 (elección válida): esperaba 1 fila en matches, dio %', v_count;
  END IF;
END $$;

-- ============================================================
-- Caso 3: reintento, mismo uuid, sigue habiendo una fila
-- ============================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ff3041a6-febe-4e85-925b-ae5216b73361","role":"authenticated"}', true);
DO $$
DECLARE v_id uuid; v_esperado uuid;
BEGIN
  v_esperado := current_setting('prueba.match_id')::uuid;
  SELECT elegir_candidato('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111') INTO v_id;
  IF v_id <> v_esperado THEN
    RAISE EXCEPTION 'caso 3 (reintento): esperaba el mismo uuid %, dio %', v_esperado, v_id;
  END IF;
END $$;

RESET ROLE;
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM matches WHERE donacion_id = 'b1111111-1111-1111-1111-111111111111';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'caso 3 (reintento): esperaba seguir con 1 fila, dio %', v_count;
  END IF;
END $$;

-- ============================================================
-- Caso 4: segunda elección (otra necesidad) rechazada
-- ============================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ff3041a6-febe-4e85-925b-ae5216b73361","role":"authenticated"}', true);
DO $$
DECLARE v_id uuid; v_hubo_error boolean := false; v_mensaje text;
BEGIN
  BEGIN
    SELECT elegir_candidato('b1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222') INTO v_id;
  EXCEPTION WHEN OTHERS THEN
    v_hubo_error := true;
    v_mensaje := sqlerrm;
  END;
  IF NOT v_hubo_error THEN
    RAISE EXCEPTION 'caso 4 (segunda elección rechazada): esperaba error, no lo hubo (uuid=%)', v_id;
  END IF;
  IF v_mensaje <> 'La donación no está activa o no es tuya' THEN
    RAISE EXCEPTION 'caso 4 (segunda elección rechazada): mensaje inesperado: %', v_mensaje;
  END IF;
END $$;

RESET ROLE;
DO $$
DECLARE v_count int; v_necesidad uuid;
BEGIN
  SELECT count(*) INTO v_count FROM matches WHERE donacion_id = 'b1111111-1111-1111-1111-111111111111';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'caso 4 (segunda elección rechazada): esperaba seguir con 1 fila, dio %', v_count;
  END IF;
  SELECT necesidad_id INTO v_necesidad FROM matches WHERE donacion_id = 'b1111111-1111-1111-1111-111111111111';
  IF v_necesidad <> 'a1111111-1111-1111-1111-111111111111' THEN
    RAISE EXCEPTION 'caso 4 (segunda elección rechazada): la necesidad del match cambió a %', v_necesidad;
  END IF;
END $$;

-- ============================================================
-- Caso 5: la contraparte lee, en las dos direcciones
-- ============================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"ff3041a6-febe-4e85-925b-ae5216b73361","role":"authenticated"}', true);
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM contactos WHERE usuario_id = 'f3b6d105-625f-400e-8d1d-dd5a3d0364a0';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'caso 5 (B lee contacto de A): esperaba 1 fila, dio %', v_count;
  END IF;
END $$;

SELECT set_config('request.jwt.claims', '{"sub":"f3b6d105-625f-400e-8d1d-dd5a3d0364a0","role":"authenticated"}', true);
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM contactos WHERE usuario_id = 'ff3041a6-febe-4e85-925b-ae5216b73361';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'caso 5 (A lee contacto de B): esperaba 1 fila, dio %', v_count;
  END IF;
END $$;

-- ============================================================
-- Caso 6b: un tercero no lee, después de elegir
-- ============================================================
SELECT set_config('request.jwt.claims', '{"sub":"78d026a5-c05c-4705-b32b-b518bd05bc3b","role":"authenticated"}', true);
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM contactos
   WHERE usuario_id IN ('f3b6d105-625f-400e-8d1d-dd5a3d0364a0', 'ff3041a6-febe-4e85-925b-ae5216b73361');
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'caso 6b (tercero C, después de elegir): esperaba 0 filas, dio %', v_count;
  END IF;
END $$;

RESET ROLE;
ROLLBACK;
