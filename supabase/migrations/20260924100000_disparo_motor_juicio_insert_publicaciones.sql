-- ============================================
-- DISPARO ASINCRÓNICO A n8n EN INSERT DE PUBLICACIONES
-- ============================================
-- Cuando se inserta una publicación, avisa al webhook "motor-juicio" de n8n
-- (Header Auth) con { "id": <publicacion.id> }, sin esperar la ejecución.
--
-- La URL y el secreto NO están acá: se leen de Vault (vault.decrypted_secrets),
-- con los nombres motor_webhook_url y motor_webhook_secret. Esos dos secretos
-- se cargan a mano por entorno (ver docs), nunca por migración ni por seed.

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Quien inserta es un usuario común (rol authenticated), que no puede leer Vault.
-- La función es SECURITY DEFINER con search_path fijo, y sólo lee esos dos
-- secretos y manda el id: no lee ni escribe ninguna tabla. Nunca hace fallar
-- el alta: si falta un secreto, o Vault/pg_net fallan, la publicación se crea
-- igual y no se avisa (esos avisos los recupera el barrido de avisos perdidos).
CREATE OR REPLACE FUNCTION public.avisar_motor_juicio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_secret TEXT;
BEGIN
  BEGIN
    SELECT decrypted_secret INTO v_url
      FROM vault.decrypted_secrets
      WHERE name = 'motor_webhook_url';

    SELECT decrypted_secret INTO v_secret
      FROM vault.decrypted_secrets
      WHERE name = 'motor_webhook_secret';

    IF v_url IS NULL OR v_secret IS NULL THEN
      RETURN new;
    END IF;

    PERFORM net.http_post(
      url := v_url,
      body := jsonb_build_object('id', new.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-motor-secret', v_secret
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Nunca hace fallar el alta.
    NULL;
  END;

  RETURN new;
END;
$$;

COMMENT ON FUNCTION public.avisar_motor_juicio IS
  'AFTER INSERT en publicaciones: avisa al webhook motor-juicio de n8n con el id. Lee URL y secreto de Vault (motor_webhook_url, motor_webhook_secret); si faltan, no avisa pero no hace fallar el INSERT.';

-- Sólo INSERT: un UPDATE no dispara el aviso.
CREATE TRIGGER on_publicacion_creada_avisar_motor
  AFTER INSERT ON public.publicaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.avisar_motor_juicio();
