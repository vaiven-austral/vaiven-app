-- ============================================================
-- SCRIPT DE SEMILLA PARA DEMO DE MATCHING (6 Usuarios + 20 Publicaciones)
-- ============================================================

-- 1. LIMPIEZA
-- DELETE FROM public.publicaciones;
-- DELETE FROM auth.users WHERE email LIKE '%@vaiven.dev';

-- 2. CREACIÓN DE USUARIOS (6)
-- UUIDs:
-- Usuario A: f3b6d105-625f-400e-8d1d-dd5a3d0364a0
-- Usuario B: ff3041a6-febe-4e85-925b-ae5216b73361
-- Usuario C: 78d026a5-c05c-4705-b32b-b518bd05bc3b
-- Usuario D: 6723bd6b-18f7-486a-806b-dbab31d35620
-- Usuario E: acc5626b-15d6-40f6-bba8-080859c55539
-- Usuario F: 76e7c5c3-4acf-40da-9115-638c442c866a
--
-- Password para los 6: vaiven123

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at, is_sso_user, is_anonymous
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'f3b6d105-625f-400e-8d1d-dd5a3d0364a0', 'authenticated', 'authenticated',
   'usuario-a@vaiven.dev', extensions.crypt('vaiven123', extensions.gen_salt('bf')),
   now(), '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"nombre_visible":"Usuario A"}',
   false, now(), now() - interval '9 days', false, false),
  ('00000000-0000-0000-0000-000000000000', 'ff3041a6-febe-4e85-925b-ae5216b73361', 'authenticated', 'authenticated',
   'usuario-b@vaiven.dev', extensions.crypt('vaiven123', extensions.gen_salt('bf')),
   now(), '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"nombre_visible":"Usuario B"}',
   false, now(), now() - interval '310 days', false, false),
  ('00000000-0000-0000-0000-000000000000', '78d026a5-c05c-4705-b32b-b518bd05bc3b', 'authenticated', 'authenticated',
   'usuario-c@vaiven.dev', extensions.crypt('vaiven123', extensions.gen_salt('bf')),
   now(), '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"nombre_visible":"Usuario C"}',
   false, now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', '6723bd6b-18f7-486a-806b-dbab31d35620', 'authenticated', 'authenticated',
   'usuario-d@vaiven.dev', extensions.crypt('vaiven123', extensions.gen_salt('bf')),
   now(), '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"nombre_visible":"Usuario D"}',
   false, now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'acc5626b-15d6-40f6-bba8-080859c55539', 'authenticated', 'authenticated',
   'usuario-e@vaiven.dev', extensions.crypt('vaiven123', extensions.gen_salt('bf')),
   now(), '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"nombre_visible":"Usuario E"}',
   false, now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', '76e7c5c3-4acf-40da-9115-638c442c866a', 'authenticated', 'authenticated',
   'usuario-f@vaiven.dev', extensions.crypt('vaiven123', extensions.gen_salt('bf')),
   now(), '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"nombre_visible":"Usuario F"}',
   false, now(), now(), false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
SELECT gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
FROM auth.users u
WHERE u.id IN (
  'f3b6d105-625f-400e-8d1d-dd5a3d0364a0',
  'ff3041a6-febe-4e85-925b-ae5216b73361',
  '78d026a5-c05c-4705-b32b-b518bd05bc3b',
  '6723bd6b-18f7-486a-806b-dbab31d35620',
  'acc5626b-15d6-40f6-bba8-080859c55539',
  '76e7c5c3-4acf-40da-9115-638c442c866a'
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- 3. ACTUALIZACIÓN DE PERFILES (Zona y Avatar para scoring de confianza y cercanía)
-- Usuario A: Perfil completo (Caballito, Comuna 6, AMBA: zona_id=1178)
UPDATE public.perfiles
SET avatar_ruta = '/avatars/usuario-a.webp', zona_id = 1178, rol_preferido = 'receptor'
WHERE id = 'f3b6d105-625f-400e-8d1d-dd5a3d0364a0';

-- Usuario B: Perfil completo (Misma localidad Caballito: zona_id=1178)
UPDATE public.perfiles
SET avatar_ruta = '/avatars/usuario-b.webp', zona_id = 1178, rol_preferido = 'donante'
WHERE id = 'ff3041a6-febe-4e85-925b-ae5216b73361';

-- Usuario C: Perfil parcial (Sin avatar, Mismo partido Comuna 6: zona_id=66)
UPDATE public.perfiles
SET avatar_ruta = NULL, zona_id = 66, rol_preferido = 'donante'
WHERE id = '78d026a5-c05c-4705-b32b-b518bd05bc3b';

-- Usuario D: Perfil parcial (Con avatar, sin zona)
UPDATE public.perfiles
SET avatar_ruta = '/avatars/usuario-d.webp', zona_id = NULL, rol_preferido = 'donante'
WHERE id = '6723bd6b-18f7-486a-806b-dbab31d35620';

-- Usuario E: Perfil completo (Avatar + Zona Avellaneda, AMBA: zona_id=550)
UPDATE public.perfiles
SET avatar_ruta = '/avatars/usuario-e.webp', zona_id = 550, rol_preferido = 'donante'
WHERE id = 'acc5626b-15d6-40f6-bba8-080859c55539';

-- Usuario F: Perfil básico (Sin avatar + Zona Rosario, Santa Fe: zona_id=4430)
UPDATE public.perfiles
SET avatar_ruta = NULL, zona_id = 4430, rol_preferido = 'receptor'
WHERE id = '76e7c5c3-4acf-40da-9115-638c442c866a';

UPDATE perfiles
SET creado_en = now() - interval '9 days'
WHERE id = 'f3b6d105-625f-400e-8d1d-dd5a3d0364a0';

UPDATE perfiles
SET creado_en = now() - interval '310 days'
WHERE id = 'ff3041a6-febe-4e85-925b-ae5216b73361';

-- 4. 10 NECESIDADES
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, urgencia, cantidad, vence_en
) VALUES
  -- N1: Necesidad origen del guion (Usuario A, Ropa, Alta, Caballito)
  (
    'a1111111-1111-1111-1111-111111111111',
    'f3b6d105-625f-400e-8d1d-dd5a3d0364a0', 'necesidad', 'activa',
    'Necesidad urgente de ropa de abrigo para familia',
    'Estamos necesitando abrigos, camperas y calzado para pasar el invierno en familia. Agradecemos mucho cualquier colaboración.',
    3, 1178, 'alta', 4, now() + interval '30 days'
  ),
  -- N2: Usuario A - Colchón (Muebles)
  (
    'a2222222-2222-2222-2222-222222222222',
    'f3b6d105-625f-400e-8d1d-dd5a3d0364a0', 'necesidad', 'activa',
    'Colchón de 1 plaza para niño',
    'Buscamos un colchón en buen estado para habitación infantil.',
    2, 1178, 'media', 1, now() + interval '30 days'
  ),
  -- N3: Usuario F - Electrodomésticos en Rosario
  (
    'a3333333-3333-3333-3333-333333333333',
    '76e7c5c3-4acf-40da-9115-638c442c866a', 'necesidad', 'activa',
    'Heladera familiar o frigobar',
    'Se nos rompió la heladera y necesitamos conservar alimentos y medicamentos. Urgencia alta.',
    1, 4430, 'alta', 1, now() + interval '30 days'
  ),
  -- N4: Usuario F - Libros escolares
  (
    'a4444444-4444-4444-4444-444444444444',
    '76e7c5c3-4acf-40da-9115-638c442c866a', 'necesidad', 'activa',
    'Libros escolares y manuales de primaria',
    'Libros de texto de matemática y lengua para nivel primario.',
    6, 4430, 'sin_apuro', 5, now() + interval '30 days'
  ),
  -- N5: Usuario C - Ropa deportiva
  (
    'a5555555-5555-5555-5555-555555555555',
    '78d026a5-c05c-4705-b32b-b518bd05bc3b', 'necesidad', 'activa',
    'Ropa deportiva y zapatillas talle 40',
    'Zapatillas y ropa cómoda para entrenamiento comunitario de jóvenes del barrio.',
    3, 66, 'media', 2, now() + interval '30 days'
  ),
  -- N6: Usuario E - Cochecito bebé en Avellaneda
  (
    'a6666666-6666-6666-6666-666666666666',
    'acc5626b-15d6-40f6-bba8-080859c55539', 'necesidad', 'activa',
    'Cochecito para bebé en buen estado',
    'Para una familia que espera su primer hijo y no tiene recursos para comprar uno nuevo.',
    4, 550, 'alta', 1, now() + interval '30 days'
  ),
  -- N7: Usuario D - Silla de ruedas
  (
    'a7777777-7777-7777-7777-777777777777',
    '6723bd6b-18f7-486a-806b-dbab31d35620', 'necesidad', 'activa',
    'Silla de ruedas o andador ortopédico',
    'Para abuela en rehabilitación de cadera. Urgencia media.',
    7, 1193, 'media', 1, now() + interval '30 days'
  ),
  -- N8: Usuario B - Herramientas
  (
    'a8888888-8888-8888-8888-888888888888',
    'ff3041a6-febe-4e85-925b-ae5216b73361', 'necesidad', 'activa',
    'Herramientas manuales de carpintería',
    'Martillos, serruchos y destornilladores para taller social de oficio.',
    8, 1178, 'sin_apuro', 3, now() + interval '30 days'
  ),
  -- N9: Vencida (Prueba de descarte por fecha)
  (
    'a9999999-9999-9999-9999-999999999999',
    '78d026a5-c05c-4705-b32b-b518bd05bc3b', 'necesidad', 'activa',
    'Frazadas y mantas de abrigo (vencida)',
    'Campaña de abrigo para invierno ya finalizada el mes pasado.',
    9, 66, 'alta', 5, now() - interval '2 days'
  ),
  -- N10: Completada (Prueba de descarte por estado)
  (
    'a0000000-0000-0000-0000-000000000000',
    'acc5626b-15d6-40f6-bba8-080859c55539', 'necesidad', 'completada',
    'Mochila escolar reforzada (completada)',
    'Mochila para inicio de clases ya conseguida.',
    6, 550, 'alta', 1, now() + interval '30 days'
  ),
  -- N11: En Proceso
  (
    'a1000000-0000-0000-0000-000000000000',
    'acc5626b-15d6-40f6-bba8-080859c55539', 'necesidad', 'en_proceso',
    'Mochila escolar reforzada (en proceso)',
    'Mochila para inicio de clases en proceso de obtención.',
    6, 550, 'alta', 1, now() + interval '30 days'
  );

-- 5. 10 DONACIONES
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en
) VALUES
  -- D1: Candidato #1 para N1 (Usuario B, Misma Localidad Caballito, Perfil Completo) -> MAX SCORE
  (
    'b1111111-1111-1111-1111-111111111111',
    'ff3041a6-febe-4e85-925b-ae5216b73361', 'donacion', 'activa',
    'Lote de camperas y ropa de abrigo talle M y L',
    'Donamos varias prendas de abrigo de invierno en perfecto estado, lavadas y listas para usar. Incluye camperas y buzos abrigados.',
    3, 1178, 'como_nuevo', 5, now() + interval '30 days'
  ),
  -- D2: Candidato #2 para N1 (Usuario C, Mismo Partido Comuna 6, Perfil Parcial)
  (
    'b2222222-2222-2222-2222-222222222222',
    '78d026a5-c05c-4705-b32b-b518bd05bc3b', 'donacion', 'activa',
    'Buzos polares y sweaters de abrigo',
    'Prendas de lana y polar para invierno en buen estado general con poco uso.',
    3, 66, 'bueno', 3, now() + interval '30 days'
  ),
  -- D3: Candidato #3 para N1 (Usuario E, Misma Región AMBA Avellaneda, Perfil Completo)
  (
    'b3333333-3333-3333-3333-333333333333',
    'acc5626b-15d6-40f6-bba8-080859c55539', 'donacion', 'activa',
    'Calzado de invierno y zapatillas variadas',
    'Zapatillas y botas para adultos y niños, en excelente estado de conservación y limpias.',
    3, 550, 'nuevo', 4, now() + interval '30 days'
  ),
  -- D4: Candidato #4 para N1 (Usuario D, Misma Región AMBA Palermo, Perfil Parcial)
  (
    'b4444444-4444-4444-4444-444444444444',
    '6723bd6b-18f7-486a-806b-dbab31d35620', 'donacion', 'activa',
    'Bufandas, guantes y gorros de lana',
    'Accesorios tejidos para el frío, limpios y en muy buen estado.',
    3, 1193, 'bueno', 6, now() + interval '30 days'
  ),
  -- D5: Candidato #5 para N1 (Usuario F, Otra Región Rosario, Perfil Vacío) -> Menor Score
  (
    'b5555555-5555-5555-5555-555555555555',
    '76e7c5c3-4acf-40da-9115-638c442c866a', 'donacion', 'activa',
    'Ropa variada desde Rosario',
    'Prendas de ropa usada en buen estado para donar a quien lo necesite.',
    3, 4430, 'usado', 10, now() + interval '30 days'
  ),
  -- D6: Donación propia de Usuario A (NO debe matchear con N1 porque es del mismo usuario)
  (
    'b6666666-6666-6666-6666-666666666666',
    'f3b6d105-625f-400e-8d1d-dd5a3d0364a0', 'donacion', 'activa',
    'Remeras talle S para donar (propia)',
    'Remeras de verano que ya no uso, limpias.',
    3, 1178, 'bueno', 3, now() + interval '30 days'
  ),
  -- D7: Donación de Colchón
  (
    'b7777777-7777-7777-7777-777777777777',
    'ff3041a6-febe-4e85-925b-ae5216b73361', 'donacion', 'activa',
    'Colchón de resortes 1 plaza',
    'Colchón en excelente estado, sin manchas, muy poco uso.',
    2, 1178, 'como_nuevo', 1, now() + interval '30 days'
  ),
  -- D8: Donación de Cochecito
  (
    'b8888888-8888-8888-8888-888888888888',
    '6723bd6b-18f7-486a-806b-dbab31d35620', 'donacion', 'activa',
    'Cochecito paragüitas plegable',
    'Cochecito liviano para bebé, funciona perfecto todo el mecanismo.',
    4, 550, 'bueno', 1, now() + interval '30 days'
  ),
  -- D9: Donación de Silla de ruedas
  (
    'b9999999-9999-9999-9999-999999999999',
    '78d026a5-c05c-4705-b32b-b518bd05bc3b', 'donacion', 'activa',
    'Silla de ruedas estándar plegable',
    'Silla de ruedas con frenos y apoyapiés funcionando perfectamente.',
    7, 66, 'bueno', 1, now() + interval '30 days'
  ),
  -- D10: Donación completada (NO debe aparecer en el matching)
  (
    'b0000000-0000-0000-0000-000000000000',
    'acc5626b-15d6-40f6-bba8-080859c55539', 'donacion', 'completada',
    'Mesa de comedor con 4 sillas (completada)',
    'Juego de mesa y sillas que ya fue entregado a otra familia.',
    2, 550, 'usado', 1, now() + interval '30 days'
  );

-- ============================================================
-- 6. ESCALÓN DE PROXIMIDAD
-- Heladera de Usuario C en Sarandí vs 4 donaciones de heladera:
--   Sarandí   (zona 546)  -> misma localidad
--   Wilde     (zona 548)  -> mismo partido (Avellaneda)
--   Palermo   (zona 1193) -> misma región AMBA (Comuna 14)
--   Rosario   (zona 4430) -> otra región (Santa Fe)
-- El orden de estos 4 IDs ya da el orden esperado por la query del ticket
-- (ORDER BY region, partido, localidad -> Sarandí, Wilde, Palermo, Rosario).
-- ============================================================

-- Necesidad de heladera, en Sarandí
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, urgencia, cantidad, vence_en
) VALUES (
  'c1111111-1111-1111-1111-111111111111',
  '78d026a5-c05c-4705-b32b-b518bd05bc3b', 'necesidad', 'activa',
  'Heladera para familia en Sarandí',
  'Se nos rompió la heladera y no podemos conservar alimentos ni medicamentos. Cualquier heladera que funcione nos sirve.',
  1, 546, 'alta', 1, now() + interval '30 days'
);

-- Las 4 donaciones de heladera, una por escalón
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en
) VALUES
  -- Misma localidad: Sarandí (zona 546). Ésta es la que en H3-B.1 lleva las 3 fotos.
  (
    'c2222222-2222-2222-2222-222222222222',
    'ff3041a6-febe-4e85-925b-ae5216b73361', 'donacion', 'activa',
    'Heladera con freezer, funcionando',
    'Heladera con freezer en funcionamiento, la cambiamos por una más grande. Se puede retirar cuando quieras.',
    1, 546, 'bueno', 1, now() + interval '30 days'
  ),
  -- Mismo partido: Wilde (zona 548, partido Avellaneda igual que Sarandí)
  (
    'c3333333-3333-3333-3333-333333333333',
    '6723bd6b-18f7-486a-806b-dbab31d35620', 'donacion', 'activa',
    'Heladera pequeña ideal para monoambiente',
    'Heladera chica, funciona bien, ideal para poca gente.',
    1, 548, 'usado', 1, now() + interval '30 days'
  ),
  -- Misma región AMBA: Palermo (zona 1193, Comuna 14 — distinto partido, misma region AMBA)
  (
    'c4444444-4444-4444-4444-444444444444',
    'acc5626b-15d6-40f6-bba8-080859c55539', 'donacion', 'activa',
    'Heladera No Frost en buen estado',
    'Heladera No Frost, funciona perfecto, se regala por mudanza.',
    1, 1193, 'como_nuevo', 1, now() + interval '30 days'
  ),
  -- Otra región: Rosario (zona 4430, Santa Fe)
  (
    'c5555555-5555-5555-5555-555555555555',
    '76e7c5c3-4acf-40da-9115-638c442c866a', 'donacion', 'activa',
    'Heladera usada, funciona bien',
    'Heladera con algunos años de uso pero en buen funcionamiento.',
    1, 4430, 'usado', 1, now() + interval '30 days'
  );
