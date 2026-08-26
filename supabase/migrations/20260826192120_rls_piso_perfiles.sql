ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Lectura autentficada de perfiles"
ON public.perfiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Modificación del perfil autenticando al usuario"
ON public.perfiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());


-- Otorgar permisos a usuarios autenticados
GRANT SELECT ON public.perfiles TO authenticated;
GRANT UPDATE ON public.perfiles TO authenticated;

-- Nota: INSERT no se otorga a usuarios - lo maneja el trigger con SECURITY DEFINER
-- DELETE tampoco se otorga - previene eliminación de perfiles desde la app