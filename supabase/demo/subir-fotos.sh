#!/usr/bin/env bash
# Sube las fotos del caso «La compu para estudiar» al Storage local y las asocia a sus publicaciones.
# Se corre DESPUÉS de cargar supabase/demo/caso-compu-para-estudiar.sql, con el stack local levantado:
#
#   bash supabase/demo/subir-fotos.sh
#
# Lo hace como la app: inicia sesión con cada usuario (contraseña de la semilla), sube el archivo a su
# propia carpeta del bucket privado «publicaciones» ({usuario_id}/{publicacion_id}/{orden}.jpg) e inserta
# la fila de imagenes_publicacion. No usa claves de administrador. Se puede repetir sin duplicar.
#
# Las fotos NO están en el repo (ver README.md): se leen de supabase/demo/fotos/ o de la carpeta que
# indique FOTOS_DIR. Si falta alguna, avisa y sigue sin ella: la demo funciona igual, solo que sin esa foto.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
FOTOS="${FOTOS_DIR:-$AQUI/fotos}"
eval "$(cd "$AQUI/../.." && pnpm --silent supabase status -o env 2>/dev/null | sed 's/^/SB_/')"
: "${SB_API_URL:?no pude leer la URL de la API: ¿está levantado supabase?}" "${SB_ANON_KEY:?falta la clave anónima}"
PASS=vaiven123

# email | id del usuario | id de la publicación | orden | archivo
FOTOS_DEL_CASO="
usuario-b@vaiven.dev|ff3041a6-febe-4e85-925b-ae5216b73361|b1000000-0000-0000-0000-000000000001|0|donacion-0-equipo-completo.jpg
usuario-b@vaiven.dev|ff3041a6-febe-4e85-925b-ae5216b73361|b1000000-0000-0000-0000-000000000001|1|donacion-1-equipo-19-pulgadas.jpg
usuario-b@vaiven.dev|ff3041a6-febe-4e85-925b-ae5216b73361|b1000000-0000-0000-0000-000000000001|2|donacion-2-monitor.jpg
usuario-c@vaiven.dev|78d026a5-c05c-4705-b32b-b518bd05bc3b|a1000000-0000-0000-0000-000000000002|0|pedido-gamer-pc-rgb.jpg
usuario-d@vaiven.dev|6723bd6b-18f7-486a-806b-dbab31d35620|a1000000-0000-0000-0000-000000000003|0|pedido-diseno-tableta-con-lapiz.jpg
usuario-e@vaiven.dev|acc5626b-15d6-40f6-bba8-080859c55539|a1000000-0000-0000-0000-000000000004|0|pedido-ocio-notebook-en-la-cama.jpg
usuario-f@vaiven.dev|76e7c5c3-4acf-40da-9115-638c442c866a|a1000000-0000-0000-0000-000000000005|0|pedido-estudiante-facultad.jpg
"

subidas=0; faltan=0
while IFS='|' read -r email uid pub orden archivo; do
  [ -n "$email" ] || continue
  if [ ! -f "$FOTOS/$archivo" ]; then
    echo "AVISO: falta $archivo en $FOTOS (se sigue sin esa foto)" >&2
    faltan=$((faltan + 1)); continue
  fi
  token=$(curl -fsS "$SB_API_URL/auth/v1/token?grant_type=password" -H "apikey: $SB_ANON_KEY" \
    -H "Content-Type: application/json" -d "{\"email\":\"$email\",\"password\":\"$PASS\"}" | jq -r .access_token)
  ruta="$uid/$pub/$orden.jpg"
  # Para poder repetir el script: el dueño borra la foto y su fila si ya estaban (las políticas no dejan pisarlas).
  curl -sS -o /dev/null -X DELETE "$SB_API_URL/storage/v1/object/publicaciones/$ruta" -H "apikey: $SB_ANON_KEY" \
    -H "Authorization: Bearer $token" || true
  curl -sS -o /dev/null -X DELETE "$SB_API_URL/rest/v1/imagenes_publicacion?publicacion_id=eq.$pub&orden=eq.$orden" \
    -H "apikey: $SB_ANON_KEY" -H "Authorization: Bearer $token" || true
  curl -fsS -o /dev/null -X POST "$SB_API_URL/storage/v1/object/publicaciones/$ruta" -H "apikey: $SB_ANON_KEY" \
    -H "Authorization: Bearer $token" -H "Content-Type: image/jpeg" -H "x-upsert: true" --data-binary "@$FOTOS/$archivo"
  curl -fsS -o /dev/null -X POST "$SB_API_URL/rest/v1/imagenes_publicacion?on_conflict=publicacion_id,orden" \
    -H "apikey: $SB_ANON_KEY" -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"publicacion_id\":\"$pub\",\"ruta_storage\":\"$ruta\",\"orden\":$orden}"
  echo "ok: $email → $pub (orden $orden)"
  subidas=$((subidas + 1))
done <<<"$FOTOS_DEL_CASO"

if [ "$faltan" -gt 0 ]; then
  echo "AVISO: se subieron $subidas de $((subidas + faltan)) fotos. Pedile la carpeta de fotos a quien armó la demo y copiala en $FOTOS (ver supabase/demo/README.md)." >&2
fi
