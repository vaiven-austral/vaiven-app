-- ============================================================
-- CASO DE DEMO: «LA COMPU PARA ESTUDIAR»
-- Una PC de escritorio donada contra cuatro pedidos de compu que compiten.
-- Categoría 5: Tecnología | Zona 1178: Caballito (Comuna 6, CABA)
-- Puntaje = resolución (nivel × 10) + urgencia o estado (hasta 10) + proximidad (misma
-- zona 20, mismo partido 13, misma región 7, otra 0) + confianza del perfil (0, 5 o 10)
-- + calidad (hasta 5) + categoría (15). Los datos de este caso (zonas, textos y perfiles)
-- están pensados para que los colores y el orden se parezcan a los del guión: las cuatro
-- compus arriba (mamá ~98, ocio ~50, diseño ~48, gamer ~45) y recién después los pedidos
-- de la semilla que no son del caso (ropa de abrigo ~43, colchón ~38).
-- ============================================================
-- Este archivo NO es parte de supabase/seed.sql: se carga APARTE, después de la
-- receta de ese archivo (reset sin semilla, secretos de Vault, semilla a mano), y
-- con n8n levantado y el workflow del motor activo. Así seed.sql (que usa la
-- Action del reporter de KPIs) y sus valores esperados quedan como están.
--
--   docker exec -i supabase_db_vaiven-app psql -U postgres < supabase/demo/caso-compu-para-estudiar.sql
--
-- Cada publicación nueva avisa al motor (trigger avisar_motor_juicio) y el motor
-- juzga los pares nuevos de a uno: son unos 70 pares, hay que contar con varios
-- minutos de espera. Antes de la demo, esperar a que `select count(*) from juicios;` deje de
-- crecer y comprobar:
--
--   -- juicios de la PC contra sus cinco pedidos (los de este caso son 4 + los de la semilla)
--   select n.titulo, j.nivel, j.justificacion->>'narrativa' as narrativa
--   from juicios j join publicaciones n on n.id = j.necesidad_id
--   where j.donacion_id = 'b1000000-0000-0000-0000-000000000001'
--   order by j.nivel desc;
--
-- El puntaje (anillo, barras de factores) NO se guarda en `juicios`: el flujo de
-- lectura del motor lo calcula al pedir los candidatos (resolución según el nivel
-- del juicio, urgencia o estado, proximidad, confianza del perfil, calidad y
-- categoría). Para verlo, entrar a /matching/:id con la sesión del usuario.
--
-- Usuarios (contraseña vaiven123): A = usuario-a@vaiven.dev (necesidad ganadora),
-- B = usuario-b@vaiven.dev (la donación), C, D y E = pedidos que compiten.
-- ============================================================

-- 0. PERFIL DEL DONANTE SIN FOTO NI ZONA (para mostrar la completitud del perfil)
-- La semilla deja a B con perfil completo (avatar de mentira y zona). Se le saca
-- todo para que su donación arranque con confianza 0 (la PC sale con ~88 puntos en
-- la pantalla de la mamá) y, al subir su foto desde Editar perfil, suba a ~93.
-- Con la zona cargada también, llegaría a ~98.
UPDATE public.perfiles
SET avatar_ruta = NULL, zona_id = NULL
WHERE id = 'ff3041a6-febe-4e85-925b-ae5216b73361';

-- 1. LA DONACIÓN (Usuario B: ff3041a6-febe-4e85-925b-ae5216b73361)
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion,
  categoria_id, zona_id, estado_objeto, cantidad, vence_en
) VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'ff3041a6-febe-4e85-925b-ae5216b73361',
  'donacion', 'activa',
  'PC de escritorio completa con monitor 19 y periféricos',
  'Gabinete con procesador Intel i3, 8GB RAM, disco SSD rápido y Windows 10 recién instalado. Incluye monitor LED 19 pulgadas, teclado, mouse y antena Wi-Fi USB. Funciona perfecta y fluida para tareas escolares, paquete Office, Zoom y navegación web. La cambié por renovación.',
  5, 1178, 'como_nuevo', 1, now() + interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- 2. NECESIDAD GANADORA - Estudio Escolar (Usuario A: f3b6d105-625f-400e-8d1d-dd5a3d0364a0)
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion,
  categoria_id, zona_id, urgencia, cantidad, vence_en
) VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'f3b6d105-625f-400e-8d1d-dd5a3d0364a0',
  'necesidad', 'activa',
  'Compu o notebook para que mi hija no quede libre en la secundaria',
  'Estamos necesitando urgente una computadora sencilla para que mi hija de 14 años pueda hacer las tareas del colegio, entrar a Google Classroom y buscar información en internet. Hoy comparte un celular con pantalla rota con sus dos hermanos y se le hace imposible entregar los trabajos.',
  5, 1178, 'alta', 1, now() + interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- 3. NECESIDAD COMPETIDORA A - Gaming / Capricho (Usuario C: 78d026a5-c05c-4705-b32b-b518bd05bc3b)
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion,
  categoria_id, zona_id, urgencia, cantidad, vence_en
) VALUES (
  'a1000000-0000-0000-0000-000000000002',
  '78d026a5-c05c-4705-b32b-b518bd05bc3b',
  'necesidad', 'activa',
  'PC gamer potente para jugar Warzone y streaming',
  'Busco una PC gamer con placa de video dedicada buena para jugar con mis amigos al Valorant, CS2 y Warzone. Si tiene luces RGB y teclado mecánico mejor. Urgencia media.',
  5, 550, 'sin_apuro', 1, now() + interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- 4. NECESIDAD COMPETIDORA B - Diseño Touch Profesional (Usuario D: 6723bd6b-18f7-486a-806b-dbab31d35620)
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion,
  categoria_id, zona_id, urgencia, cantidad, vence_en
) VALUES (
  'a1000000-0000-0000-0000-000000000003',
  '6723bd6b-18f7-486a-806b-dbab31d35620',
  'necesidad', 'activa',
  'Notebook táctil o iPad con lápiz para carrera de diseño gráfico',
  'Necesito equipo portátil con pantalla táctil sensible a la presión o tableta digitalizadora para cursar ilustración digital en FADU. Tiene que bancar Photoshop e Illustrator pesados.',
  5, 1193, 'media', 1, now() + interval '30 days'
) ON CONFLICT (id) DO NOTHING;

-- 5. NECESIDAD COMPETIDORA C - Portabilidad / Ocio (Usuario E: acc5626b-15d6-40f6-bba8-080859c55539)
INSERT INTO public.publicaciones (
  id, usuario_id, tipo, estado, titulo, descripcion,
  categoria_id, zona_id, urgencia, cantidad, vence_en
) VALUES (
  'a1000000-0000-0000-0000-000000000004',
  'acc5626b-15d6-40f6-bba8-080859c55539',
  'necesidad', 'activa',
  'Notebook liviana para ver series y pelis',
  'Busco una notebook liviana con buena batería para ver series y pelis. Si puedo llevarla de viaje los fines de semana, mejor.',
  5, 550, 'sin_apuro', 1, now() + interval '30 days'
) ON CONFLICT (id) DO NOTHING;
