#!/usr/bin/env bash
# Sube a Storage todas las fotos que encuentre bajo la convención de carpetas
# e inserta/actualiza su fila en imagenes_publicacion.
#
# Convención:
#   supabase/datos/fotos/{publicacion_id}/{orden}.{ext}
#   orden va de 0 a 2 (tope de 3 fotos por publicación, ver H3-B.1).
#   ext soportadas: webp, jpg, jpeg, png.
#
# Ejemplo: supabase/datos/fotos/c2222222-2222-2222-2222-222222222222/0.webp
#
# Para agregar fotos nuevas: crear la carpeta con el publicacion_id, poner
# los archivos como 0.<ext>/1.<ext>/2.<ext> y volver a correr este script.
# No hace falta tocar seed.sql ni este script.
#
# storage.objects es solo metadata: el contenido del archivo lo escribe la
# API de Storage, no un INSERT SQL. Por eso esto vive en un script aparte y
# no en seed.sql — `supabase db reset` no lo corre solo.
#
# Uso: ./supabase/scripts/seed_fotos.sh
# Requiere: supabase local levantado (pnpm supabase start)

set -euo pipefail
cd "$(dirname "$0")/../.."

FOTOS_ROOT="supabase/datos/fotos"
BUCKET="publicaciones"

API_URL=$(pnpm supabase status -o env 2>/dev/null | grep '^API_URL=' | cut -d'"' -f2)
SERVICE_ROLE_KEY=$(pnpm supabase status -o env 2>/dev/null | grep '^SERVICE_ROLE_KEY=' | cut -d'"' -f2)
DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep '^supabase_db_' | head -1)

if [ -z "$API_URL" ] || [ -z "$SERVICE_ROLE_KEY" ] || [ -z "$DB_CONTAINER" ]; then
  echo "Falta API_URL / SERVICE_ROLE_KEY / contenedor de DB. ¿Está 'pnpm supabase start' corriendo?" >&2
  exit 1
fi

if [ ! -d "$FOTOS_ROOT" ]; then
  echo "No existe ${FOTOS_ROOT}, nada para subir."
  exit 0
fi

psql_query() {
  docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -tA -c "$1"
}

shopt -s nullglob

for PUB_DIR in "$FOTOS_ROOT"/*/; do
  PUBLICACION_ID=$(basename "$PUB_DIR")

  USUARIO_ID=$(psql_query "SELECT usuario_id FROM public.publicaciones WHERE id = '${PUBLICACION_ID}';" | tr -d '[:space:]')
  if [ -z "$USUARIO_ID" ]; then
    echo "⚠️  ${PUBLICACION_ID}: no existe en publicaciones, salteo esa carpeta."
    continue
  fi

  echo "== ${PUBLICACION_ID} (usuario ${USUARIO_ID}) =="

  for ARCHIVO in "$PUB_DIR"*; do
    [ -f "$ARCHIVO" ] || continue
    NOMBRE=$(basename "$ARCHIVO")
    ORDEN="${NOMBRE%%.*}"
    EXT="${NOMBRE##*.}"

    if ! [[ "$ORDEN" =~ ^[0-2]$ ]]; then
      echo "  ⚠️  ${NOMBRE}: el nombre tiene que ser 0/1/2.<ext> (orden 0-2), salteo."
      continue
    fi

    case "$EXT" in
      webp) MIME="image/webp" ;;
      jpg|jpeg) MIME="image/jpeg" ;;
      png) MIME="image/png" ;;
      *) echo "  ⚠️  ${NOMBRE}: extensión .${EXT} no soportada, salteo."; continue ;;
    esac

    RUTA="${USUARIO_ID}/${PUBLICACION_ID}/${ORDEN}.${EXT}"

    echo "  Subiendo ${NOMBRE} -> ${BUCKET}/${RUTA}"
    curl -s -X POST "${API_URL}/storage/v1/object/${BUCKET}/${RUTA}" \
      -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
      -H "Content-Type: ${MIME}" \
      -H "x-upsert: true" \
      --data-binary "@${ARCHIVO}" \
      -o /tmp/seed_fotos_response.json -w "    HTTP %{http_code}\n"

    ESCAPED_RUTA=${RUTA//\'/\'\'}
    psql_query "
      INSERT INTO public.imagenes_publicacion (publicacion_id, ruta_storage, orden, estado_descripcion)
      VALUES ('${PUBLICACION_ID}', '${ESCAPED_RUTA}', ${ORDEN}, 'lista')
      ON CONFLICT (publicacion_id, orden)
      DO UPDATE SET ruta_storage = EXCLUDED.ruta_storage, estado_descripcion = 'lista';
    " > /dev/null
  done
done

rm -f /tmp/seed_fotos_response.json
echo "Listo."
