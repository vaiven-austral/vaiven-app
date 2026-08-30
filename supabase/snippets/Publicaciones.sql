SELECT * 
FROM public.publicaciones AS pub;

-- A crea una publicacion de A
INSERT INTO public.publicaciones (usuario_id, tipo, titulo, descripcion, categoria_id, zona_id, urgencia)
VALUES ('9aa48770-26e7-464a-9eb7-87061569f3ef', 'necesidad', 'Necesito ropa', 'Necesito ropa de abrigo', 3, 16, 'alta');

-- A intenta crear una publicacion con el id de B
INSERT INTO public.publicaciones (usuario_id, tipo, titulo, descripcion, categoria_id, zona_id, urgencia)
VALUES ('b8898350-0b0f-4ea1-aaeb-336db4bea618', 'necesidad', 'robo', 'hack', 3, 16, 'alta');

-- A intenta crear un post de necesidad con el campo estado_objeto = 'nuevo'
INSERT INTO public.publicaciones (usuario_id, tipo, titulo, descripcion, categoria_id, zona_id, urgencia, estado_objeto)
VALUES ('9aa48770-26e7-464a-9eb7-87061569f3ef', 'necesidad', 'Necesito libros', 'desc', 6, 16, 'media', 'nuevo');

-- A intenta crear un post de donacion con el campo urgencia = 'alta'
INSERT INTO public.publicaciones (usuario_id, tipo, titulo, descripcion, categoria_id, zona_id, urgencia, estado_objeto)
VALUES ('9aa48770-26e7-464a-9eb7-87061569f3ef', 'donacion', 'Necesito libros', 'desc', 6, 16, 'alta', 'nuevo');

-- A modifica el estado de su publicacion (antes en default -> activa)
UPDATE public.publicaciones SET estado = 'completada', actualizada_en = now()
WHERE usuario_id = '9aa48770-26e7-464a-9eb7-87061569f3ef' and titulo = 'Necesito ropa';

SELECT  titulo, estado
FROM public.publicaciones
WHERE titulo = 'Necesito ropa';

-- B intenta borrar el post de A
DELETE FROM public.publicaciones 
WHERE usuario_id = '9aa48770-26e7-464a-9eb7-87061569f3ef' and titulo = 'Necesito ropa';

