#!/usr/bin/env bash
# ==============================================================================
# Script para cargar la Demo completa con juicios de IA del motor y fotos
# ==============================================================================
# 1. Reset de Supabase sin semilla (pnpm supabase db reset --no-seed)
# 2. Configura los secretos en Vault (URL de n8n y secreto de n8n-data/.secreto)
# 3. Carga la semilla seed.sql (dispara los avisos al motor)
# 4. Sube las fotos de publicaciones a Storage con seed_fotos.sh
# 5. Espera a que el motor termine de juzgar los 99 pares
# 6. Prepara el caso borde de la demo dejando 1 candidato pendiente sin juicio
# ==============================================================================
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$AQUI/../.." && pwd)"

cd "$APP_DIR"

DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep '^supabase_db_' | head -1 || true)
if [ -z "$DB_CONTAINER" ]; then
  echo "❌ Error: No se encontró el contenedor de Supabase. Levantalo con 'pnpm supabase start'." >&2
  exit 1
fi

SECRETO_FILE="$APP_DIR/n8n-data/.secreto"
if [ ! -f "$SECRETO_FILE" ]; then
  echo "❌ Error: No se encontró el archivo $SECRETO_FILE con el secreto de n8n." >&2
  exit 1
fi
MOTOR_SECRET="$(cat "$SECRETO_FILE" | tr -d '[:space:]')"

# Verificar si n8n está corriendo, si no levantarlo
if ! docker ps --format '{{.Names}}' | grep -q '^n8n$'; then
  echo "Iniciando contenedor n8n..."
  docker start n8n || true
fi

echo "== [1/5] Reseteando base de datos sin semilla (--no-seed) =="
pnpm supabase db reset --no-seed

echo "== [2/5] Configurando secretos en Vault =="
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres <<EOF
delete from vault.secrets where name in ('motor_webhook_url', 'motor_webhook_secret');
select vault.create_secret('http://n8n:5678/webhook/motor-juicio', 'motor_webhook_url');
select vault.create_secret('${MOTOR_SECRET}', 'motor_webhook_secret');
EOF

echo "== [3/5] Cargando semilla de publicaciones (dispara juicios en n8n) =="
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres < "$APP_DIR/supabase/seed.sql"

echo "== [4/5] Subiendo fotos de publicaciones a Storage =="
"$APP_DIR/supabase/scripts/seed_fotos.sh"

echo "== [5/5] Esperando a que el motor termine de juzgar los 99 pares =="
tope=$(( $(date +%s) + 180 ))
quietos=0
previo=-1

while true; do
  n=$(docker exec "$DB_CONTAINER" psql -U postgres -d postgres -tA -c "select count(*) from juicios;" 2>/dev/null || echo 0)
  echo "Juicios procesados: $n / 99..."
  
  if [ "$n" -ge 99 ]; then
    break
  fi

  if [ "$n" = "$previo" ] && [ "$n" -gt 0 ]; then
    quietos=$((quietos + 1))
    if [ "$quietos" -ge 8 ]; then
      break
    fi
  else
    quietos=0
  fi

  if [ "$(date +%s)" -gt "$tope" ]; then
    echo "⚠️ Aviso: Tiempo límite alcanzado ($n juicios generados)."
    break
  fi

  previo=$n
  sleep 3
done

echo "== [6/6] Preparando casos para la demo (candidato pendiente y perfil editable) =="
# 1. Dejamos la donación de bufandas (D4) sin juicio frente a la necesidad N1
# para mostrar en cámara el estado «Resolución · Pendiente» y el aviso «La IA todavía está analizando este match»
# 2. Dejamos el perfil de Usuario A sin avatar ni zona para mostrar la edición en vivo
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres <<EOF
delete from juicios
where donacion_id = 'b4444444-4444-4444-4444-444444444444'
  and necesidad_id = 'a1111111-1111-1111-1111-111111111111';

update public.perfiles
set avatar_ruta = null, zona_id = null
where id = 'f3b6d105-625f-400e-8d1d-dd5a3d0364a0';
EOF

echo ""
echo "🎉 ¡Demo lista para grabar!"
echo "   - Publicaciones: $(docker exec "$DB_CONTAINER" psql -U postgres -d postgres -tA -c "select count(*) from publicaciones;")"
echo "   - Juicios de IA: $(docker exec "$DB_CONTAINER" psql -U postgres -d postgres -tA -c "select count(*) from juicios;") (98 completos + 1 pendiente para la demo)"
echo "   - Caso borde: 'Bufandas, guantes y gorros' figura como 'Resolución · Pendiente' (sin botón de análisis)"
echo "   - Fotos subidas en bucket 'publicaciones'"
echo "   - Servidor frontend en http://localhost:5173"
