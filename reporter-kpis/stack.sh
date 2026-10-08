#!/usr/bin/env bash
# Stack efímero del reporter de KPIs. Lo entrega dirección: no se edita.
#
#   bash reporter-kpis/stack.sh demo     Supabase local + n8n con el workflow de main, Vault, semilla de la demo,
#                                        espera al motor y 20 lecturas del motor (para latencia_p95).
#   bash reporter-kpis/stack.sh golden   Sobre el stack ya levantado: carga el golden set (borra la demo),
#                                        espera al motor y carga la tabla referencia_golden_set.
#
# Variables: APP_DIR (raíz de vaiven-app, por defecto «.»), VERTEX_SA_JSON (service account del modelo; sin ella
# el motor no juzga y la corrida sigue, con los KPIs del motor reflejando el error).
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "${APP_DIR:-.}" && pwd)"
SALIDA="${SALIDA:-$PWD/salida}"; mkdir -p "$SALIDA"
N8N_DATA="${N8N_DATA:-$PWD/n8n-data}"
DB=supabase_db_vaiven-app
RED=supabase_network_vaiven-app
SUDO="${SUDO:-}"
t() { echo "$(date +%s) $1" | tee -a "$SALIDA/tiempos.txt"; }
psql_app() { docker exec -i "$DB" psql -U postgres -v ON_ERROR_STOP=1 -q "$@"; }

# Espera al motor: sin avisos en cola, sin ejecuciones en curso y con `juicios` quieta durante 15 s
# (o en el objetivo, si se pasa). Con un tope: si se cumple, avisa y sigue.
esperar_motor() {
  local tope=$(( $(date +%s) + ${1:-300} )) objetivo="${2:-}" cola enCurso n previo=-1 quietos=0
  sleep 5
  while :; do
    cola=$(docker exec "$DB" psql -U postgres -Atc "select count(*) from net.http_request_queue")
    enCurso=$($SUDO sqlite3 -readonly "$N8N_DATA/database.sqlite" \
      "select count(*) from execution_entity where status in ('new','running','waiting')")
    n=$(docker exec "$DB" psql -U postgres -Atc "select count(*) from juicios")
    if [ -n "$objetivo" ] && [ "$n" -ge "$objetivo" ]; then break; fi
    if [ "$cola" = 0 ] && [ "$enCurso" = 0 ] && [ "$n" = "$previo" ]; then quietos=$((quietos + 1)); else quietos=0; fi
    [ "$quietos" -ge 5 ] && break
    [ "$(date +%s)" -gt "$tope" ] && { echo "AVISO: el motor no terminó en el tope ($n juicios); se sigue" >&2; break; }
    previo=$n; sleep 3
  done
  echo "juicios: $n" | tee -a "$SALIDA/tiempos.txt"
}

vault() {
  psql_app -v sec="$(cat "$N8N_DATA/.secreto")" <<'SQL'
delete from vault.secrets where name in ('motor_webhook_url', 'motor_webhook_secret');
select vault.create_secret('http://n8n:5678/webhook/motor-juicio', 'motor_webhook_url');
select vault.create_secret(:'sec', 'motor_webhook_secret');
SQL
}

demo() {
  t inicio
  # supabase start carga seed.sql antes de que exista Vault: se resetea sin semilla y se carga después.
  (cd "$APP_DIR" && pnpm supabase start -x studio,imgproxy,mailpit,edge-runtime,logflare,vector,supavisor,realtime,postgres-meta \
    && pnpm supabase db reset --no-seed)
  eval "$(cd "$APP_DIR" && pnpm supabase status -o env | sed 's/^/SB_/')"
  t supabase_arriba

  mkdir -p "$N8N_DATA" && chmod 777 "$N8N_DATA"
  docker rm -f n8n >/dev/null 2>&1 || true
  docker run -d --name n8n --network "$RED" --add-host=host.docker.internal:host-gateway -p 5678:5678 \
    -e N8N_ENCRYPTION_KEY="$(openssl rand -hex 24)" -e GENERIC_TIMEZONE=America/Argentina/Buenos_Aires \
    -v "$N8N_DATA:/home/node/.n8n" n8nio/n8n:2.39.5 >/dev/null
  until curl -sf localhost:5678/healthz >/dev/null; do sleep 2; done
  t n8n_arriba

  # Credenciales locales con los mismos id que referencia el workflow de main, más la del modelo.
  openssl rand -hex 24 > "$N8N_DATA/.secreto"
  curl -s localhost:54321/auth/v1/.well-known/jwks.json > "$N8N_DATA/.jwks.json"
  python3 -I "$AQUI/datos/credenciales.py" "$SB_JWT_SECRET" "$(cat "$N8N_DATA/.secreto")" \
    "$N8N_DATA/.jwks.json" "$APP_DIR/n8n/workflows/matching-v2.json" "$N8N_DATA"
  docker exec n8n n8n import:credentials --input=/home/node/.n8n/creds.json
  docker exec n8n n8n import:workflow --input=/home/node/.n8n/wf.json
  docker exec n8n n8n publish:workflow --id=W1NAqx1tZqOrSgwA
  rm -f "$N8N_DATA/creds.json" "$N8N_DATA/wf.json"
  docker restart n8n >/dev/null
  until [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST localhost:5678/webhook/motor-juicio)" = 403 ]; do sleep 2; done
  t workflow_publicado

  vault
  psql_app < "$APP_DIR/supabase/seed.sql"
  t semilla_cargada
  esperar_motor 300
  t demo_juzgada

  # 20 lecturas reales del motor, como usuario-a, para que latencia_p95 tenga qué medir.
  local token pub
  token=$(curl -fsS "localhost:54321/auth/v1/token?grant_type=password" -H "apikey: $SB_ANON_KEY" \
    -H "Content-Type: application/json" -d '{"email":"usuario-a@vaiven.dev","password":"vaiven123"}' | jq -r .access_token)
  pub=$(docker exec "$DB" psql -U postgres -Atc "select p.id from publicaciones p join auth.users u on u.id = p.usuario_id
    where u.email = 'usuario-a@vaiven.dev' and p.estado = 'activa' order by p.creada_en limit 1")
  for _ in $(seq 20); do
    curl -fsS -o /dev/null -X POST localhost:5678/webhook/matching-v1 -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" -d "{\"publicacion_id\":\"$pub\"}" || echo "AVISO: una lectura falló" >&2
  done
  t lecturas
}

golden() {
  psql_app < "$AQUI/datos/golden-1-necesidades.sql"
  esperar_motor 120
  psql_app < "$AQUI/datos/golden-2-donaciones.sql"
  esperar_motor 420 90   # 6 donaciones × 15 necesidades
  psql_app < "$AQUI/datos/referencia-golden-set.sql"
  t golden_juzgado
}

case "${1:-}" in
  demo) demo ;;
  golden) golden ;;
  *) echo "uso: $0 demo|golden" >&2; exit 2 ;;
esac
