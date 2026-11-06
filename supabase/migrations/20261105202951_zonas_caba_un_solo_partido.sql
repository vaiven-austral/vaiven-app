-- ============================================================
-- MIGRACIÓN: CABA como un solo partido en zonas
-- Unifica las 15 filas "Comuna N" (nivel comuna y nivel barrio) en un único
-- partido 'CABA', con los barrios como localidad. Elimina la fila basura
-- id=4460 ('Comuna 2' / 'Ciudad de Buenos Aires'). Los ids de los barrios
-- (p.ej. 1178 Caballito, 1193 Palermo) no cambian.
-- ============================================================

DO $$
DECLARE
  v_caba_id int;
BEGIN
  -- 1. Fila CABA sin barrio: la fila de nivel comuna (localidad IS NULL) de menor id (hoy, 66)
  SELECT id INTO v_caba_id
  FROM public.zonas
  WHERE localidad IS NULL AND partido LIKE 'Comuna %'
  ORDER BY id ASC
  LIMIT 1;

  UPDATE public.zonas
  SET partido = 'CABA', id_indec = '02'
  WHERE id = v_caba_id;

  -- 2. Reasignar publicaciones y perfiles de las otras 14 comunas a la fila CABA sin barrio,
  --    y borrar esas 14 filas.
  UPDATE public.publicaciones
  SET zona_id = v_caba_id
  WHERE zona_id IN (
    SELECT id FROM public.zonas
    WHERE localidad IS NULL AND partido LIKE 'Comuna %' AND id <> v_caba_id
  );

  UPDATE public.perfiles
  SET zona_id = v_caba_id
  WHERE zona_id IN (
    SELECT id FROM public.zonas
    WHERE localidad IS NULL AND partido LIKE 'Comuna %' AND id <> v_caba_id
  );

  DELETE FROM public.zonas
  WHERE localidad IS NULL AND partido LIKE 'Comuna %' AND id <> v_caba_id;

  -- 3. Fila 4460 ('Comuna 2' / 'Ciudad de Buenos Aires'): precondición que aborta la migración
  --    si hay referencias en publicaciones o perfiles; si no, se borra.
  IF EXISTS (SELECT 1 FROM public.publicaciones WHERE zona_id = 4460)
     OR EXISTS (SELECT 1 FROM public.perfiles WHERE zona_id = 4460) THEN
    RAISE EXCEPTION 'zonas.id=4460 (Comuna 2 / Ciudad de Buenos Aires) está referenciada en publicaciones o perfiles; no se puede eliminar';
  END IF;

  DELETE FROM public.zonas WHERE id = 4460;

  -- 4. Barrios restantes: partido pasa a CABA, conservan id e id_indec.
  --    La fila 4460 ya no existe en este punto, así que no se renombra por error.
  UPDATE public.zonas
  SET partido = 'CABA'
  WHERE region = 'AMBA' AND partido LIKE 'Comuna %' AND localidad IS NOT NULL;
END $$;
