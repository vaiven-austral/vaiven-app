#!/usr/bin/env bash
# Una función por KPI. Cada una imprime UN número (con punto decimal) y nada más.
# Si no se puede calcular, falla (return distinto de 0) con un mensaje en stderr: nunca inventa un valor.
# Qué imprime cada una, y las reglas comunes: kit, kpis/reporter.md.
#
# Usen sólo estos cuatro accesos. Los arma dirección: no se editan.
#   sql_app "<consulta>"   base del stack local (sólo acuerdo_golden_set)
#   rpc_app                llama a kpi_agregados() en KPI_DEV_URL; devuelve una fila JSON con los KPIs 2, 3 y 6
#   n8n_api "<query>"     GET a /api/v1/executions?<query> del n8n desplegado, filtrado al workflow del motor
#   gh_api  "<ruta>"      GET a la API de GitHub, p. ej. "repos/$KPI_REPO/actions/runs?status=completed&per_page=100"

sql_app() { docker exec -i supabase_db_vaiven-app psql -U postgres -At -v ON_ERROR_STOP=1 -c "$1"; }
rpc_app()  {
  : "${KPI_DEV_URL:?rpc_app: falta KPI_DEV_URL}" "${KPI_DEV_PUBLISHABLE_KEY:?rpc_app: falta KPI_DEV_PUBLISHABLE_KEY}"
  curl -fsS -X POST "$KPI_DEV_URL/rest/v1/rpc/kpi_agregados" \
    -H "apikey: $KPI_DEV_PUBLISHABLE_KEY" -H 'Content-Type: application/json' -d '{}'
}
n8n_api()  {
  : "${KPI_N8N_URL:?n8n_api: falta KPI_N8N_URL}" \
    "${KPI_N8N_WORKFLOW_ID:?n8n_api: falta KPI_N8N_WORKFLOW_ID}" \
    "${KPI_N8N_API_KEY:?n8n_api: falta KPI_N8N_API_KEY}"
  curl -fsS "$KPI_N8N_URL/api/v1/executions?$1&workflowId=$KPI_N8N_WORKFLOW_ID" \
    -H "X-N8N-API-KEY: $KPI_N8N_API_KEY"
}
gh_api()   { curl -fsS -H "Authorization: Bearer ${GH_TOKEN:?falta GH_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/$1"; }
KPI_REPO="${KPI_REPO:-vaiven-austral/vaiven-app}"

# Convierte una fecha ISO 8601 de la API de n8n (con o sin milisegundos) a milisegundos epoch.
# fromdateiso8601 rechaza las fechas con fracción; esta función las conserva.
# Uso dentro de jq: (.startedAt | ms)
MS_FUNC='def ms: (sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601) * 1000
         + (((capture("\\.(?<f>[0-9]+)Z$").f // "0") + "00")[:3] | tonumber);'

# ---- H4-KPI.1 -----------------------------------------------------------------------

candidatos_por_donacion() {
  # Promedio, sobre las donaciones activas con al menos un juicio, de los juicios con nivel >= 2.
  local resp
  resp=$(rpc_app) || { echo "candidatos_por_donacion: falló rpc_app" >&2; return 1; }
  echo "$resp" | jq -er '.[0].candidatos_por_donacion' \
    || { echo "candidatos_por_donacion: no se pudo calcular (sin donaciones activas con juicios)" >&2; return 1; }
}

latencia_p95() {
  # p95 (posición ceil(0,95 × N)) de la duración de las últimas 20 ejecuciones exitosas de lectura.
  # Lectura = runData contiene "Webhook" y NO "Webhook Motor Juicio".
  local cursor="" n=0 tmp page
  tmp=$(mktemp) || return 1
  trap 'rm -f "$tmp"' RETURN

  while [ "$n" -lt 20 ]; do
    local q="status=success&includeData=true&limit=50"
    [ -n "$cursor" ] && q="${q}&cursor=${cursor}"
    page=$(n8n_api "$q") || { echo "latencia_p95: falló n8n_api" >&2; return 1; }

    echo "$page" | jq -r '
      '"$MS_FUNC"'
      .data[]
      | select(.data.resultData.runData | (has("Webhook") and (has("Webhook Motor Juicio") | not)))
      | ((.stoppedAt | ms) - (.startedAt | ms)) | round' >> "$tmp"

    n=$(wc -l < "$tmp")
    cursor=$(echo "$page" | jq -r '.nextCursor // empty')
    [ -z "$cursor" ] && break
  done

  [ "$n" -eq 0 ] && { echo "latencia_p95: no hay lecturas" >&2; return 1; }

  head -n 20 "$tmp" | sort -n | jq -s '
    length as $N
    | .[(($N * 95 + 99) / 100 | floor) - 1]'
}

juicios_generados() {
  # Filas de juicios con creado_en en las últimas 24 h, desde vaiven-dev.
  local resp
  resp=$(rpc_app) || { echo "juicios_generados: falló rpc_app" >&2; return 1; }
  echo "$resp" | jq -er '.[0].juicios_generados' \
    || { echo "juicios_generados: no se pudo calcular" >&2; return 1; }
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
  local resp
  resp=$(rpc_app) || { echo "tiempo_hasta_primer_juicio_p95: falló rpc_app" >&2; return 1; }
  echo "$resp" | jq -er '.[0].tiempo_hasta_primer_juicio_p95' \
    || { echo "tiempo_hasta_primer_juicio_p95: no hay publicaciones con juicio" >&2; return 1; }
}

errores_5xx() {
  # % de ejecuciones del motor con status = 'error' sobre el total en las últimas 24 h.
  # Sin ejecuciones: imprime 0 con exit 0 (sin uso no hubo fallas; la falta de uso se ve en otros KPIs).
  local ahora_menos_24h cursor="" tmp page
  ahora_menos_24h=$(jq -nr 'now - 86400 | todate')
  tmp=$(mktemp) || return 1
  trap 'rm -f "$tmp"' RETURN

  while true; do
    local q="startedAfter=${ahora_menos_24h}&limit=250"
    [ -n "$cursor" ] && q="${q}&cursor=${cursor}"
    page=$(n8n_api "$q") || { echo "errores_5xx: falló n8n_api" >&2; return 1; }

    echo "$page" | jq -r '.data[].status' >> "$tmp"

    cursor=$(echo "$page" | jq -r '.nextCursor // empty')
    [ -z "$cursor" ] && break
  done

  local total errores
  total=$(wc -l < "$tmp")
  if [ "$total" -eq 0 ]; then
    echo "0"
    return 0
  fi

  errores=$(grep -c "^error$" "$tmp" || true)
  jq -nr --argjson e "$errores" --argjson t "$total" '
    if $e == 0 then "0"
    else (($e * 10000 / $t | round) / 100 | tostring) end'
}

ultima_ejecucion_antiguedad() {
  # Segundos entre ahora y el stoppedAt de la última ejecución exitosa del motor.
  # La API ordena por id descendente; el stoppedAt mayor se obtiene comparando en ms.
  local cursor="" tmp page
  tmp=$(mktemp) || return 1
  trap 'rm -f "$tmp"' RETURN

  while true; do
    local q="status=success&limit=250"
    [ -n "$cursor" ] && q="${q}&cursor=${cursor}"
    page=$(n8n_api "$q") || { echo "ultima_ejecucion_antiguedad: falló n8n_api" >&2; return 1; }

    echo "$page" | jq -r '
      '"$MS_FUNC"'
      .data[] | (.stoppedAt | ms)' >> "$tmp"

    cursor=$(echo "$page" | jq -r '.nextCursor // empty')
    [ -z "$cursor" ] && break
  done

  local n
  n=$(wc -l < "$tmp")
  [ "$n" -eq 0 ] && { echo "ultima_ejecucion_antiguedad: no hay ejecuciones exitosas" >&2; return 1; }

  local max_stopped
  max_stopped=$(sort -n "$tmp" | tail -n 1)

  jq -nr --argjson t "$max_stopped" '(now * 1000 - $t) / 1000 | floor'
}
