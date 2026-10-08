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
  sin_implementar
}

latencia_p95() {
  sin_implementar
}

juicios_generados() {
  sin_implementar
}

ci_builds_exitosos() {
  sin_implementar
}

api_tiempo_respuesta() {
  # URL en KPI_API_URL. Vacía o sin 200 en 10 s: imprime 10000.
  sin_implementar
}

app_tiempo_respuesta() {
  # URL en KPI_APP_URL. Vacía o sin 200 en 10 s: imprime 10000.
  sin_implementar
}

# ---- H4-KPI.2 -----------------------------------------------------------------------

acuerdo_golden_set() {
  # Se calcula en la fase del golden set (existe la tabla referencia_golden_set).
  sin_implementar
}

tiempo_hasta_primer_juicio_p95() {
  sin_implementar
}

errores_5xx() {
  sin_implementar
}

ultima_ejecucion_antiguedad() {
  sin_implementar
}
