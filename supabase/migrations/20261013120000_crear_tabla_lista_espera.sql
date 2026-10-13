-- ============================================
-- TABLA LISTA_ESPERA
-- ============================================
-- Correos de quienes se anotan en la lista de espera de la landing.
-- Se guarda sólo el correo y la fecha. Nadie lee la lista por la API: la lee
-- dirección desde la consola de Supabase.
CREATE TABLE public.lista_espera (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Largo máximo de un correo (RFC 5321).
    CONSTRAINT lista_espera_email_largo CHECK (char_length(email) <= 254),
    -- Formato básico: algo@algo.algo, sin espacios.
    CONSTRAINT lista_espera_email_formato CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

-- Un correo se anota una sola vez, sin importar las mayúsculas.
-- Un insert repetido falla acá (409 por la API): el día que se conecte el
-- formulario, ese error se muestra como "ya estabas anotado", no como error.
CREATE UNIQUE INDEX lista_espera_email_unico_idx ON public.lista_espera (lower(email));

-- RLS
ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;

-- Quien visita la landing (sin sesión) puede anotarse.
CREATE POLICY "Anotarse en la lista de espera"
  ON public.lista_espera
  FOR INSERT
  TO anon
  WITH CHECK (true);

GRANT INSERT ON public.lista_espera TO anon;

-- No hay políticas de SELECT, UPDATE ni DELETE: nadie lee, modifica ni borra
-- filas por la API, tampoco authenticated.
