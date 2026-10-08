-- Golden set v1 · archivo 2 de 2: las 6 donaciones.
-- Cada donación dispara el juicio contra las 15 necesidades: al terminar, `select count(*) from juicios` = 90.

begin;

-- 1. Publicaciones. Cada INSERT avisa al motor.
insert into public.publicaciones (id, usuario_id, tipo, titulo, descripcion, categoria_id, zona_id, estado_objeto, cantidad, estado, vence_en) values
  -- D-01
  ('00000000-0000-4000-8000-000000002001', '00000000-0000-4000-8000-000000012001', 'donacion', 'Notebook usada', 'notebook usada anda bien. la bateria no dura nada asi q tiene q estar enchufada. tiene windows 10', (select id from public.categorias where slug = 'tecnologia'), (select id from public.zonas where region='AMBA' and partido='Vicente López' and localidad is not distinct from 'Florida'), 'usado', 1, 'activa', '2026-12-31'),
  -- D-02
  ('00000000-0000-4000-8000-000000002002', '00000000-0000-4000-8000-000000012002', 'donacion', 'Ropa de bebé 0 a 3 meses', 'ropa de bebe talle 0 a 3 meses, casi sin uso. bodys enteritos gorritos, todo lavado', (select id from public.categorias where slug = 'ropa-y-calzado'), (select id from public.zonas where region='AMBA' and partido='Comuna 13' and localidad is not distinct from 'Belgrano'), 'como_nuevo', 1, 'activa', '2026-12-31'),
  -- D-06
  ('00000000-0000-4000-8000-000000002006', '00000000-0000-4000-8000-000000012006', 'donacion', 'Bicicleta rodado 26', 'bici rodado 26, estuvo guardada años. hay q ponerle camaras nuevas y frenos', (select id from public.categorias where slug = 'transporte'), (select id from public.zonas where region='AMBA' and partido='Avellaneda' and localidad is not distinct from 'Sarandí'), 'requiere_reparacion', 1, 'activa', '2026-12-31'),
  -- D-12
  ('00000000-0000-4000-8000-000000002012', '00000000-0000-4000-8000-000000012012', 'donacion', 'Cuadernos, lápices y mochilas', 'tengo cuadernos, lapices y unas mochilas q no usamos. nuevo o casi', (select id from public.categorias where slug = 'educacion-y-libros'), (select id from public.zonas where region='AMBA' and partido='Merlo' and localidad is not distinct from 'Merlo'), 'como_nuevo', 1, 'activa', '2026-12-31'),
  -- D-13
  ('00000000-0000-4000-8000-000000002013', '00000000-0000-4000-8000-000000012013', 'donacion', 'Silla de ruedas', 'silla de ruedas era de mi papa. esta bien, las ruedas andan', (select id from public.categorias where slug = 'salud-y-movilidad'), (select id from public.zonas where region='AMBA' and partido='Lanús' and localidad is not distinct from 'Remedios de Escalada de San Martín'), 'bueno', 1, 'activa', '2026-12-31'),
  -- D-15
  ('00000000-0000-4000-8000-000000002015', '00000000-0000-4000-8000-000000012015', 'donacion', 'Libros para adultos', 'doy libros son como 30. novelas y algunos de historia, de adultos', (select id from public.categorias where slug = 'educacion-y-libros'), (select id from public.zonas where region='AMBA' and partido='General San Martín' and localidad is not distinct from 'Villa San Andrés'), 'bueno', 30, 'activa', '2026-12-31');

-- 2. Imágenes: la fila alcanza para la calidad; el archivo no existe.
insert into public.imagenes_publicacion (publicacion_id, ruta_storage, orden) values
  ('00000000-0000-4000-8000-000000002001', 'golden/d-01.webp', 0),
  ('00000000-0000-4000-8000-000000002002', 'golden/d-02.webp', 0),
  ('00000000-0000-4000-8000-000000002012', 'golden/d-12.webp', 0);

commit;

-- Verificación: tiene que dar 6.
select count(*) as donaciones from public.publicaciones where tipo = 'donacion' and id::text like '00000000-0000-4000-8000-%';
