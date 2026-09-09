-- ============================================
-- IDs de referencia
-- ============================================
-- Usuario A: 9aa48770-26e7-464a-9eb7-87061569f3ef
-- Usuario B: b8898350-0b0f-4ea1-aaeb-336db4bea618
-- Mati     : 41e1dbb7-d2fc-46e3-93cf-97decc2d3ef8
-- Vicky    : dd851b30-180d-41e9-a27a-6d9c3258e2ad

-- ============================================
-- LIMPIEZA (dejar el set anterior fuera)
-- ============================================
DELETE FROM publicaciones WHERE usuario_id IN (
  '9aa48770-26e7-464a-9eb7-87061569f3ef',
  'b8898350-0b0f-4ea1-aaeb-336db4bea618',
  '41e1dbb7-d2fc-46e3-93cf-97decc2d3ef8',
  'dd851b30-180d-41e9-a27a-6d9c3258e2ad'
);

-- ============================================
-- ZONA NUEVA: mismo partido que zona_id=6, distinta localidad
-- (el seed original no tenía este caso)
-- ============================================
INSERT INTO zonas (region, partido, localidad, id_indec, activa)
VALUES ('CABA', 'Comuna 6', 'Parque Centenario', '02006B', true)
ON CONFLICT (region, partido, localidad) DO NOTHING;

-- ============================================
-- PERFILES (completo / parcial / vacío)
-- ============================================
UPDATE perfiles
SET avatar_ruta = '/avatars/usuario-b-avatar.webp', zona_id = 6
WHERE id = 'b8898350-0b0f-4ea1-aaeb-336db4bea618';

UPDATE perfiles
SET avatar_ruta = NULL, zona_id = 5
WHERE id = '41e1dbb7-d2fc-46e3-93cf-97decc2d3ef8';

UPDATE perfiles
SET avatar_ruta = NULL, zona_id = NULL
WHERE id = 'dd851b30-180d-41e9-a27a-6d9c3258e2ad';

-- ============================================
-- ORIGEN: Necesidad de Usuario A, urgencia ALTA, zona 6
-- ============================================
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, urgencia, cantidad, vence_en)
VALUES (
  '9aa48770-26e7-464a-9eb7-87061569f3ef',
  'necesidad', 'activa',
  'Necesidad de ropa urgente',
  'Necesito ropa de abrigo para el invierno. Tamaño M. Preferiblemente colores oscuros.',
  3, 6, 'alta', 1,
  NOW() + INTERVAL '30 days'
);

-- ============================================
-- D1: Misma LOCALIDAD (zona_id=6) — Usuario B, perfil COMPLETO
-- ============================================
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en)
VALUES (
  'b8898350-0b0f-4ea1-aaeb-336db4bea618',
  'donacion', 'activa',
  'Donación D1: Misma localidad, perfil completo',
  'Ropa nueva de excelente calidad en perfecto estado. Tenemos varias prendas disponibles para donar.',
  3, 6, 'nuevo', 5,
  NOW() + INTERVAL '30 days'
);

-- ============================================
-- D2: Mismo PARTIDO (zona nueva, mismo partido 'Comuna 6') — Mati, perfil PARCIAL
-- ============================================
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en)
VALUES (
  '41e1dbb7-d2fc-46e3-93cf-97decc2d3ef8',
  'donacion', 'activa',
  'Donación D2: Mismo partido, perfil parcial',
  'Prendas de invierno en buen estado, poco uso.',
  3,
  (SELECT id FROM zonas WHERE localidad = 'Parque Centenario'),
  'bueno', 3,
  NOW() + INTERVAL '30 days'
);

-- ============================================
-- D3: Misma REGIÓN (zona_id=1, CABA distinto partido) — Vicky, perfil VACÍO
-- ============================================
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en)
VALUES (
  'dd851b30-180d-41e9-a27a-6d9c3258e2ad',
  'donacion', 'activa',
  'Donación D3: Misma región CABA',
  'Ropa de abrigo variada, bien cuidada y lista para usar.',
  3, 1, 'usado', 2,
  NOW() + INTERVAL '30 days'
);

-- ============================================
-- D4: OTRA PROVINCIA (zona_id=21, Rosario) — Vicky, perfil VACÍO
-- ============================================
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, vence_en)
VALUES (
  'dd851b30-180d-41e9-a27a-6d9c3258e2ad',
  'donacion', 'activa',
  'Donación D4: Otra provincia',
  'Ropa de donación desde Rosario.',
  3, 21, 'usado', 1,
  NOW() + INTERVAL '30 days'
);

-- ============================================
-- N2: Necesidad adicional, urgencia MEDIA — Mati (variedad + conteo mínimo)
-- ============================================
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, urgencia, cantidad, vence_en)
VALUES (
  '41e1dbb7-d2fc-46e3-93cf-97decc2d3ef8',
  'necesidad', 'activa',
  'Necesidad de calzado',
  'Busco calzado de invierno, no es urgente pero lo necesitaría pronto.',
  3, 5, 'media', 1,
  NOW() + INTERVAL '30 days'
);

-- ============================================
-- N3: Necesidad adicional, urgencia SIN_APURO — Usuario B (variedad + conteo mínimo)
-- ============================================
INSERT INTO publicaciones (usuario_id, tipo, estado, titulo, descripcion, categoria_id, zona_id, urgencia, cantidad, vence_en)
VALUES (
  'b8898350-0b0f-4ea1-aaeb-336db4bea618',
  'necesidad', 'activa',
  'Necesidad de abrigo para donar a futuro',
  'Sin apuro, puede ser más adelante en el año.',
  3, 21, 'sin_apuro', 1,
  NOW() + INTERVAL '30 days'
);