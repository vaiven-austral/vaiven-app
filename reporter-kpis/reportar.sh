#!/usr/bin/env bash
# Calcula los KPIs de la fase cargada y, en la fase del golden set, registra el catálogo si falta y envía los 10.
# Lo entrega dirección: no se edita. Las funciones de cada KPI están en kpis.sh.
#
#   bash reporter-kpis/reportar.sh          calcula; si están las dos fases, envía
#   bash reporter-kpis/reportar.sh --seco   calcula e imprime, nunca envía
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
SALIDA="${SALIDA:-$PWD/salida}"; mkdir -p "$SALIDA"
SECO=0; [ "${1:-}" = "--seco" ] && SECO=1
source "$AQUI/kpis.sh"
export LC_ALL=C

FECHA=$(TZ=America/Argentina/Buenos_Aires date +%F)
if [ "$(sql_app "select to_regclass('public.referencia_golden_set') is not null")" = t ]; then FASE=golden; else FASE=demo; fi
if [ "$FASE" = golden ]; then KPIS=(acuerdo_golden_set); else
  KPIS=(candidatos_por_donacion tiempo_hasta_primer_juicio_p95 latencia_p95 errores_5xx juicios_generados
        ci_builds_exitosos api_tiempo_respuesta app_tiempo_respuesta ultima_ejecucion_antiguedad); fi

echo "fase $FASE · fecha $FECHA"
: > "$SALIDA/filas-$FASE.jsonl"
for k in "${KPIS[@]}"; do
  if ! v=$("$k"); then echo "ERROR en $k: no se pudo calcular" >&2; exit 1; fi
  v=$(echo "$v" | tr -d '[:space:]')
  [[ "$v" =~ ^-?[0-9]+([.][0-9]+)?$ ]] || { echo "ERROR en $k: «$v» no es un número" >&2; exit 1; }
  printf '%-32s %s\n' "$k" "$v"
  jq -cn --arg k "$k" --argjson v "$v" '{kpi_id: $k, value: $v}' >> "$SALIDA/filas-$FASE.jsonl"
done

[ "$SECO" = 1 ] && { echo "modo seco: no se envía nada"; exit 0; }
[ "$FASE" = golden ] && [ -s "$SALIDA/filas-demo.jsonl" ] || { echo "falta la otra fase: no se envía todavía"; exit 0; }

: "${KPI_URL:?}" "${KPI_PUBLISHABLE_KEY:?}" "${PROJECT_KEY:?}" "${KPI_ENV:?}"
RUN_ID=$(python3 -c 'import uuid; print(uuid.uuid4())')
H=(-H "apikey: $KPI_PUBLISHABLE_KEY" -H "X-Project-Key: $PROJECT_KEY" -H "Content-Type: application/json")

# El catálogo no es reinsertable: se mandan sólo los KPIs que faltan.
registrados=$(curl --fail-with-body -sS "$KPI_URL/rest/v1/kpi_catalog?select=id" "${H[@]}")
faltan=$(jq --argjson r "$registrados" '[.[] | select(.id as $i | ($r | map(.id) | index($i)) == null)]' "$AQUI/catalogo.json")
echo "catálogo: $(jq length <<<"$registrados") registrados, $(jq length <<<"$faltan") por registrar"
if [ "$(jq length <<<"$faltan")" -gt 0 ]; then
  curl --fail-with-body -sS -X POST "$KPI_URL/rest/v1/kpi_catalog" "${H[@]}" -d "$faltan" > "$SALIDA/catalogo-respuesta.json" \
    || { echo "ERROR al registrar el catálogo:" >&2; cat "$SALIDA/catalogo-respuesta.json" >&2; exit 1; }
fi

cat "$SALIDA/filas-demo.jsonl" "$SALIDA/filas-golden.jsonl" \
  | jq -s --arg d "$FECHA" --arg e "$KPI_ENV" --arg r "$RUN_ID" 'map(. + {date: $d, env: $e, run_id: $r})' \
  > "$SALIDA/enviado.json"
[ "$(jq length "$SALIDA/enviado.json")" = 10 ] || { echo "ERROR: no son 10 filas" >&2; exit 1; }

# return=representation con las columnas que la plataforma deja leer: muestra qué filas entraron.
curl --fail-with-body -sS -X POST \
  "$KPI_URL/rest/v1/measurement?on_conflict=project_id,kpi_id,date,env&select=kpi_id,date,env" "${H[@]}" \
  -H "Prefer: resolution=ignore-duplicates,return=representation" \
  -d @"$SALIDA/enviado.json" > "$SALIDA/respuesta.json" \
  || { echo "ERROR al enviar:" >&2; cat "$SALIDA/respuesta.json" >&2; exit 1; }
echo "fecha $FECHA · run $RUN_ID · enviadas 10 · insertadas $(jq length "$SALIDA/respuesta.json")"
