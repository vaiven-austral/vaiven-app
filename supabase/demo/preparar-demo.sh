#!/usr/bin/env bash
# Rehace de cero, con un solo comando, el estado de la demo «La compu para estudiar»:
#
#   bash supabase/demo/preparar-demo.sh
#
# Hace, en orden:
#   0. Comprueba Docker, Supabase local y n8n (lo levanta o lo recrea si hace falta).
#   1. La receta de supabase/seed.sql: reset sin semilla, secretos de Vault, semilla a mano.
#   2. Carga supabase/demo/caso-compu-para-estudiar.sql y espera a que el motor juzgue.
#   3. Sube las fotos (supabase/demo/subir-fotos.sh).
#   4. Verifica juicios y puntajes con el mismo endpoint que usa la pantalla.
#
# BORRA la base local (es un `supabase db reset`). Tarda unos 5 a 10 minutos.
# Requisitos: Docker Desktop encendido, n8n con el workflow del motor ya importado en n8n-data/
# (se arma una sola vez: ver README.md, «Primera vez») y jq. No lee ni imprime la clave del modelo.
# Las fotos van en supabase/demo/fotos/ (no están en el repo; ver README.md). Si faltan, avisa y sigue.
set -euo pipefail
cd "$(cd "$(dirname "$0")/../.." && pwd)"          # raíz de vaiven-app

INICIO=$(date +%s)
paso() { printf '\n\033[1m[%ss] %s\033[0m\n' "$(( $(date +%s) - INICIO ))" "$*"; }
ok()   { echo "  ✔ $*"; }
aviso(){ echo "  ⚠ $*"; ADVERTENCIAS=$((ADVERTENCIAS + 1)); }
falla(){ echo "  ✘ $*" >&2; exit 1; }
ADVERTENCIAS=0
Q() { docker exec -i supabase_db_vaiven-app psql -U postgres -P pager=off "$@"; }

# ---------------------------------------------------------------- 0. entorno
paso "0. Entorno"
docker info >/dev/null 2>&1 || falla "Docker no responde. Encendé Docker Desktop y esperá a que diga «Engine running»."
ok "Docker responde"

if ! docker ps --format '{{.Names}}' | grep -q '^supabase_db_vaiven-app$'; then
  echo "  Supabase local no está levantado: pnpm supabase start"
  pnpm supabase start >/dev/null 2>&1 || falla "No pude levantar Supabase local."
fi
ok "Supabase local arriba"

[ -f n8n-data/.secreto ] && [ -f n8n-data/config ] || falla "Falta n8n-data/ (el n8n de la demo con el motor). Se arma una sola vez: ver «Primera vez» en supabase/demo/README.md."
n8n_sano() { curl -sf localhost:5678/healthz >/dev/null 2>&1; }
n8n_recrear() {
  local clave; clave=$(python3 -I -c 'import json; print(json.load(open("n8n-data/config"))["encryptionKey"])')
  docker rm -f n8n >/dev/null 2>&1 || true
  docker run -d --name n8n --network supabase_network_vaiven-app --add-host=host.docker.internal:host-gateway \
    -p 5678:5678 -e N8N_ENCRYPTION_KEY="$clave" -e GENERIC_TIMEZONE=America/Argentina/Buenos_Aires \
    -v "$PWD/n8n-data:/home/node/.n8n" n8nio/n8n:2.39.5 >/dev/null
}
if ! n8n_sano; then
  echo "  n8n no responde: intento levantarlo"
  docker start n8n >/dev/null 2>&1 || n8n_recrear     # si su red de Docker ya no existe, se recrea con los mismos datos
  for _ in $(seq 1 40); do n8n_sano && break; sleep 3; done
  n8n_sano || falla "n8n no levantó. Revisá: docker logs n8n"
fi
for _ in $(seq 1 20); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST localhost:5678/webhook/motor-juicio)" = 403 ] && break; sleep 3
done
[ "$(curl -s -o /dev/null -w '%{http_code}' -X POST localhost:5678/webhook/motor-juicio)" = 403 ] \
  || falla "El webhook motor-juicio de n8n no está activo (tendría que responder 403 sin secreto)."
ok "n8n arriba y con el motor activo"

# Espera a que juicios deje de crecer y n8n no tenga ejecuciones en curso (tope en segundos).
esperar_motor() {
  local tope=$(( $(date +%s) + $1 )) prev=-1 quietos=0 n cola en_curso
  while :; do
    n=$(Q -At -c 'select count(*) from juicios'); cola=$(Q -At -c 'select count(*) from net.http_request_queue')
    en_curso=$(sqlite3 -readonly n8n-data/database.sqlite "select count(*) from execution_entity where status in ('new','running','waiting')")
    if [ "$n" = "$prev" ] && [ "$cola" = 0 ] && [ "$en_curso" = 0 ]; then quietos=$((quietos + 1)); else quietos=0; fi
    prev=$n
    [ "$quietos" -ge 6 ] && [ "$n" -gt 0 ] && break
    [ "$(date +%s)" -gt "$tope" ] && { aviso "el motor no terminó en el tope de espera ($n juicios, $en_curso ejecuciones en curso)"; break; }
    sleep 5
  done
  ok "juicios estable en $n"
}

# ---------------------------------------------------------------- 1. receta de seed.sql
paso "1. Receta de la semilla (reset sin semilla, Vault, seed.sql a mano)"
pnpm supabase db reset --no-seed >/dev/null 2>&1 || falla "Falló supabase db reset --no-seed."
ok "base migrada, sin semilla"
Q -q -v ON_ERROR_STOP=1 -v sec="$(cat n8n-data/.secreto)" >/dev/null <<'SQL'
select vault.create_secret('http://host.docker.internal:5678/webhook/motor-juicio', 'motor_webhook_url');
select vault.create_secret(:'sec', 'motor_webhook_secret');
SQL
[ "$(Q -At -c 'select count(*) from vault.secrets')" = 2 ] || falla "No quedaron los 2 secretos en Vault."
ok "2 secretos en Vault"
Q -q -v ON_ERROR_STOP=1 < supabase/seed.sql >/dev/null || falla "Falló la carga de supabase/seed.sql."
ok "semilla cargada; esperando al motor..."
esperar_motor 420
BASE=$(Q -At -c 'select count(*) from juicios')
[ "$BASE" = 99 ] && ok "99 juicios, el valor esperado de la demo" || aviso "juicios de la semilla: $BASE (se esperaban 99)"

# ---------------------------------------------------------------- 2. el caso
paso "2. Caso «La compu para estudiar»"
Q -q -v ON_ERROR_STOP=1 < supabase/demo/caso-compu-para-estudiar.sql >/dev/null || falla "Falló el SQL del caso."
ok "5 publicaciones cargadas; esperando al motor (son unos 55 pares)..."
esperar_motor 1500
[ "$(Q -At -c "select count(*) from publicaciones where tipo='donacion' and estado='activa' and not exists (select 1 from juicios j where j.donacion_id=publicaciones.id)")" = 0 ] \
  && ok "ninguna donación activa quedó sin juzgar" || aviso "hay donaciones activas sin juzgar"

# ---------------------------------------------------------------- 3. fotos
paso "3. Fotos"
SALIDA_FOTOS=$(bash supabase/demo/subir-fotos.sh 2>&1) || { echo "$SALIDA_FOTOS" >&2; falla "Falló la subida de fotos (corré bash supabase/demo/subir-fotos.sh para ver el error)."; }
SUBIDAS=$(grep -c '^ok:' <<<"$SALIDA_FOTOS" || true)
if [ "$SUBIDAS" = 6 ]; then
  ok "6 fotos subidas"
else
  aviso "se subieron $SUBIDAS de 6 fotos: faltan archivos en supabase/demo/fotos/ (ver supabase/demo/README.md). La demo funciona igual, sin esas fotos."
fi
[ "$(Q -At -c "select avatar_ruta is null from perfiles where id='ff3041a6-febe-4e85-925b-ae5216b73361'")" = t ] \
  && ok "Dev 1 (usuario B) arranca sin foto de perfil" || aviso "Dev 1 ya tiene foto de perfil"

# ---------------------------------------------------------------- 4. puntajes reales
paso "4. Puntajes con el endpoint de la pantalla"
eval "$(pnpm --silent supabase status -o env 2>/dev/null | sed 's/^/SB_/')"
login() { curl -fsS "$SB_API_URL/auth/v1/token?grant_type=password" -H "apikey: $SB_ANON_KEY" -H "Content-Type: application/json" \
  -d "{\"email\":\"$1\",\"password\":\"vaiven123\"}" | jq -r .access_token; }
candidatos() { curl -s -X POST localhost:5678/webhook/matching-v1 -H "Authorization: Bearer $(login "$1")" -H "Content-Type: application/json" -d "{\"publicacion_id\":\"$2\"}"; }
FMT='"  \(.score_total|round)\t(nivel \(.nivel))\t\(.titulo[0:60])"'
echo "  Dev 1 (donante) · «Ver compatibles» de la PC:"
candidatos usuario-b@vaiven.dev b1000000-0000-0000-0000-000000000001 | jq -r ".body.candidates[:6][] | $FMT"
echo "  Dev 2 (necesitada) · «Ver compatibles» del pedido de la mamá:"
RESP=$(candidatos usuario-a@vaiven.dev a1000000-0000-0000-0000-000000000001)
echo "$RESP" | jq -r ".body.candidates[:3][] | $FMT"
PUNTAJE=$(echo "$RESP" | jq -r '.body.candidates[0].score_total // 0 | round'); NIVEL=$(echo "$RESP" | jq -r '.body.candidates[0].nivel // -1')
TITULO=$(echo "$RESP" | jq -r '.body.candidates[0].titulo // ""')
if [ "${TITULO:0:6}" = "PC de " ] && [ "$NIVEL" = 4 ] && [ "$PUNTAJE" -ge 70 ]; then
  ok "la PC es el primer match de la mamá (nivel 4, $PUNTAJE puntos, rango verde)"
else
  aviso "la PC no salió primera con nivel 4 y 70 o más (salió: «$TITULO», nivel $NIVEL, $PUNTAJE puntos)"
fi

paso "Listo en $(( $(date +%s) - INICIO )) s"
if [ "$ADVERTENCIAS" -eq 0 ]; then echo "  Estado de la demo OK. Usuarios (clave vaiven123): usuario-a@vaiven.dev (Dev 2), usuario-b@vaiven.dev (Dev 1)."
else echo "  Terminó con $ADVERTENCIAS advertencia(s): revisá los ⚠ de arriba antes de la demo."; fi
