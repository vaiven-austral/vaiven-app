-- Usuario A: 9aa48770-26e7-464a-9eb7-87061569f3ef 
-- Usuario B: b8898350-0b0f-4ea1-aaeb-336db4bea618

-- N-1: Necesidad activa de Usuario A
INSERT INTO public.publicaciones (usuario_id, tipo, titulo, descripcion, categoria_id, zona_id, urgencia)
VALUES ('9aa48770-26e7-464a-9eb7-87061569f3ef', 'necesidad', 'Necesito ropa', 'Necesito ropa de abrigo', 3, 16, 'alta')
RETURNING id as "N-1";

-- D-1:
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, 
categoria_id, zona_id, estado_objeto, cantidad, vence_en)
VALUES ('b8898350-0b0f-4ea1-aaeb-336db4bea618', 'donacion', 'activa', 'Donación de ropa', 'Ropa nueva en perfecto estado', 3, 16, 'nuevo', 10, NOW() + INTERVAL '30 days')
RETURNING id as "D-1";

-- D-2:
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, 
descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en)
VALUES ('b8898350-0b0f-4ea1-aaeb-336db4bea618', 'donacion', 'completada', 'Donación completada', 
'Ya fue entregada', 1, 1, 'usado', 5, NOW() + INTERVAL '30 days')
RETURNING id as "D-2";

-- D-3:
INSERT INTO publicaciones (usuario_id, tipo, estado, 
titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en)
VALUES ('9aa48770-26e7-464a-9eb7-87061569f3ef', 'donacion', 'activa', 
'Mi donación propia', 'No debería aparecer en resultados', 2, 2, 'nuevo', 3, NOW() + INTERVAL '30 days')
RETURNING id as "D-3";