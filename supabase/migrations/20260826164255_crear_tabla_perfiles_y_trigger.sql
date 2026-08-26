-- Crear tabla perfiles
CREATE TABLE public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_visible TEXT NOT NULL,
    avatar_ruta TEXT,
    zona_id INT,
    rol_preferido TEXT, --- 'donante' o 'receptor' 
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear función trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_visible, creado_en)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre_visible', SPLIT_PART(new.email, '@', 1)),
    NOW()
  );
  RETURN new;
END;
$$;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
