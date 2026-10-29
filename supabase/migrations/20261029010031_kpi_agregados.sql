-- Función que devuelve los tres KPIs de la base ya calculados, sin exponer filas.
-- security definer: corre con los permisos del dueño, sin que RLS la frene.
-- search_path = '': cada tabla se califica; una sin esquema no se encuentra.
-- Solo ejecutable por anon: con sesión da 403 (el grant lo impide, no es barrera de datos).
CREATE OR REPLACE FUNCTION public.kpi_agregados()
RETURNS TABLE (
  candidatos_por_donacion          numeric,
  tiempo_hasta_primer_juicio_p95   numeric,
  juicios_generados                bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  with
  -- KPI 2: promedio de candidatos (nivel >= 2) por donación activa con al menos un juicio
  kpi2 as (
    select round(avg(c), 2) as val
    from (
      select count(*) filter (where j.nivel >= 2) as c
      from public.publicaciones p
      join public.juicios j on j.donacion_id = p.id
      where p.tipo = 'donacion' and p.estado = 'activa'
      group by p.id
    ) t
  ),
  -- KPI 3: p95 (en segundos) del tiempo entre publicación y su primer juicio,
  --        sobre las últimas 20 publicaciones con algún juicio
  kpi3 as (
    with w as (
      select p.id,
             extract(epoch from min(j.creado_en) - p.creada_en) as s
      from public.publicaciones p
      join public.juicios j on p.id in (j.donacion_id, j.necesidad_id)
      group by p.id, p.creada_en
      order by p.creada_en desc
      limit 20
    )
    select round(
      percentile_disc(0.95) within group (order by s)::numeric, 1
    ) as val
    from w
  ),
  -- KPI 6: juicios insertados o actualizados en las últimas 24 h
  kpi6 as (
    select count(*) as val
    from public.juicios
    where creado_en > now() - interval '24 hours'
  )
  select
    kpi2.val as candidatos_por_donacion,
    kpi3.val as tiempo_hasta_primer_juicio_p95,
    kpi6.val as juicios_generados
  from kpi2, kpi3, kpi6;
$$;

-- Permisos estrictos: solo anon puede ejecutarla; public y authenticated no.
REVOKE EXECUTE ON FUNCTION public.kpi_agregados() FROM public, authenticated;
GRANT  EXECUTE ON FUNCTION public.kpi_agregados() TO anon;
