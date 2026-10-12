#!/usr/bin/env bash
# Una función por KPI. Cada una imprime UN número (con punto decimal) y nada más.
# Si no se puede calcular, falla (return distinto de 0) con un mensaje en stderr: nunca inventa un valor.
# Qué imprime cada una, y las reglas comunes: kit, kpis/reporter.md.
#
# Usen sólo estos tres accesos. Los arma dirección: no se editan.
#   sql_app "<consulta>"   base de la app (Postgres local), salida sin encabezado
#   sql_n8n "<consulta>"   historial de ejecuciones de n8n (SQLite, sólo lectura)
#   gh_api  "<ruta>"       GET a la API de GitHub, p. ej. "repos/$KPI_REPO/actions/runs?status=completed&per_page=100"

sql_app() { docker exec -i supabase_db_vaiven-app psql -U postgres -At -v ON_ERROR_STOP=1 -c "$1"; }
sql_n8n() { ${SUDO:-} sqlite3 -readonly "${N8N_DATA:-$PWD/n8n-data}/database.sqlite" "$1"; }
gh_api()  { curl -fsS -H "Authorization: Bearer ${GH_TOKEN:?falta GH_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/$1"; }
KPI_REPO="${KPI_REPO:-vaiven-austral/vaiven-app}"
sin_implementar() { echo "sin implementar" >&2; return 1; }

# ---- H4-KPI.1 -----------------------------------------------------------------------

candidatos_por_donacion() {
  # Promedio, sobre las donaciones activas con al menos un juicio, de los juicios con nivel >= 2.
  local v
  v=$(sql_app "select round(avg(c), 2) from (
      select count(*) filter (where j.nivel >= 2) as c
      from publicaciones p join juicios j on j.donacion_id = p.id
      where p.tipo = 'donacion' and p.estado = 'activa'
      group by p.id) t") || { echo "candidatos_por_donacion: falló la consulta" >&2; return 1; }
  [ -n "$v" ] || { echo "candidatos_por_donacion: no hay donaciones activas con juicios" >&2; return 1; }
  echo "$v"
}

latencia_p95() {
  # p95 (posición ceil(0,95 × N)) de la duración de las últimas 20 ejecuciones exitosas de lectura.
  # Lectura = el historial menciona "Webhook" y no "Webhook Motor Juicio" (las de juicio mencionan ambos).
  local v
  v=$(sql_n8n "with ult as (
      select cast(round((julianday(e.stoppedAt) - julianday(e.startedAt)) * 86400000) as integer) as ms
      from execution_entity e join execution_data d on d.executionId = e.id
      where e.status = 'success'
        and d.data like '%\"Webhook\"%' and d.data not like '%\"Webhook Motor Juicio\"%'
      order by e.startedAt desc limit 20),
    o as (select ms, row_number() over (order by ms) as rn, count(*) over () as n from ult)
    select ms from o where rn = (n * 95 + 99) / 100") || { echo "latencia_p95: falló la consulta al historial de n8n" >&2; return 1; }
  [ -n "$v" ] || { echo "latencia_p95: no hay ejecuciones exitosas de lectura" >&2; return 1; }
  echo "$v"
}

juicios_generados() {
  local v
  v=$(sql_app "select count(*) from juicios where creado_en > now() - interval '24 hours'") \
    || { echo "juicios_generados: falló la consulta" >&2; return 1; }
  echo "$v"
}

ci_builds_exitosos() {
  # % de corridas success sobre las últimas 20 terminadas de los workflows "Check …", sin skipped ni cancelled.
  local runs
  runs=$(gh_api "repos/$KPI_REPO/actions/runs?status=completed&per_page=100") \
    || { echo "ci_builds_exitosos: falló la API de GitHub" >&2; return 1; }
  echo "$runs" | jq -er '
    [.workflow_runs[] | select(.name | startswith("Check ")) | select(.conclusion != "skipped" and .conclusion != "cancelled")][:20]
    | if length == 0 then error("no hay corridas Check") else ((map(select(.conclusion == "success")) | length) * 1000 / length | round) / 10 end' \
    || { echo "ci_builds_exitosos: no se pudo calcular" >&2; return 1; }
}

# Milisegundos hasta un 200 (máx. 10 s). URL vacía, error de red o código distinto de 200: 10000.
medir_http() {
  local url="$1" out
  [ -n "$url" ] || { echo 10000; return 0; }
  out=$(LC_ALL=C curl -s -o /dev/null --max-time 10 -w '%{http_code} %{time_total}' "$url") || { echo 10000; return 0; }
  if [ "${out%% *}" = 200 ]; then
    LC_ALL=C awk -v t="${out#* }" 'BEGIN { printf "%d\n", t * 1000 + 0.5 }'
  else
    echo 10000
  fi
}

api_tiempo_respuesta() {
  # URL en KPI_API_URL. Vacía o sin 200 en 10 s: imprime 10000.
  medir_http "${KPI_API_URL:-}"
}

app_tiempo_respuesta() {
  # URL en KPI_APP_URL. Vacía o sin 200 en 10 s: imprime 10000.
  medir_http "${KPI_APP_URL:-}"
}

# ---- H4-KPI.2 -----------------------------------------------------------------------

acuerdo_golden_set() {
  # Pares del golden set donde el nivel del motor coincide con el de referencia, dividido por 31.
  local v
  v=$(sql_app "with ref as (
      select count(*) as n from referencia_golden_set
    )
    select case
      when (select n from ref) != 31 then null
      else round(count(*) filter (where j.nivel = r.nivel)::numeric / 31, 3)
    end
    from referencia_golden_set r
    join juicios j on j.donacion_id = r.donacion_id and j.necesidad_id = r.necesidad_id") \
    || { echo "acuerdo_golden_set: falló la consulta" >&2; return 1; }
  [ -n "$v" ] || { echo "acuerdo_golden_set: la referencia no tiene 31 filas o no se pudo calcular" >&2; return 1; }
  echo "$v"
}

tiempo_hasta_primer_juicio_p95() {
  # p95 (en segundos) de la espera entre publicación y su primer juicio, sobre las últimas 20 publicaciones juzgadas.
  local v
  v=$(sql_app "with w as (
      select p.id, extract(epoch from min(j.creado_en) - p.creada_en) as s
      from publicaciones p join juicios j on p.id in (j.donacion_id, j.necesidad_id)
      group by p.id, p.creada_en order by p.creada_en desc limit 20)
    select round(percentile_disc(0.95) within group (order by s)::numeric, 1) from w") \
    || { echo "tiempo_hasta_primer_juicio_p95: falló la consulta" >&2; return 1; }
  [ -n "$v" ] || { echo "tiempo_hasta_primer_juicio_p95: no hay publicaciones con juicio" >&2; return 1; }
  echo "$v"
}

errores_5xx() {
  # % de ejecuciones del motor con status = 'error' sobre el total en las últimas 24 h.
  local v
  v=$(sql_n8n "with ult as (
      select status
      from execution_entity
      where julianday('now') - julianday(startedAt) <= 1.0)
    select case
      when count(*) = 0 then ''
      when sum(case when status = 'error' then 1 else 0 end) = 0 then '0'
      else cast(round(100.0 * sum(case when status = 'error' then 1 else 0 end) / count(*), 2) as text)
    end
    from ult") || { echo "errores_5xx: falló la consulta al historial de n8n" >&2; return 1; }
  [ -n "$v" ] || { echo "errores_5xx: no hay ejecuciones en las últimas 24 h" >&2; return 1; }
  echo "$v"
}

ultima_ejecucion_antiguedad() {
  # Segundos entre ahora y el stoppedAt de la última ejecución exitosa del motor.
  local v
  v=$(sql_n8n "select case
      when max(stoppedAt) is null then ''
      else cast(round((julianday('now') - julianday(max(stoppedAt))) * 86400) as integer)
    end
    from execution_entity
    where status = 'success'") || { echo "ultima_ejecucion_antiguedad: falló la consulta a n8n" >&2; return 1; }
  [ -n "$v" ] || { echo "ultima_ejecucion_antiguedad: no hay ejecuciones exitosas" >&2; return 1; }
  echo "$v"
}
