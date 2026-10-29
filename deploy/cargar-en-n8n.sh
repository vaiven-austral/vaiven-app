#!/usr/bin/env bash
# Se corre EN LA VM, en ~/n8n, con creds.json y wf.json (los arma importar.sh) en la carpeta personal.
# Importa las credenciales y el workflow, lo publica, reinicia n8n y borra los dos archivos.
set -euo pipefail
cd ~/n8n
WF_ID=$(python3 -c 'import json,os; print(json.load(open(os.path.expanduser("~/wf.json")))["id"])')
# Por stdin, para que el archivo quede del usuario de n8n (docker cp lo deja de root y n8n no lo lee).
docker compose exec -T n8n sh -c 'umask 077; cat > /tmp/creds.json' < ~/creds.json
docker compose exec -T n8n sh -c 'cat > /tmp/wf.json' < ~/wf.json
rm -f ~/creds.json ~/wf.json
# Si falla la importación, el script corta con error (la limpieza no tapa el fallo).
docker compose exec -T n8n sh -c "n8n import:credentials --input=/tmp/creds.json && n8n import:workflow --input=/tmp/wf.json && n8n publish:workflow --id=$WF_ID; r=\$?; rm -f /tmp/creds.json /tmp/wf.json; exit \$r"
docker compose restart n8n
echo "Listo. En un minuto: https://<host>/webhook/motor-juicio por POST tiene que dar 403."
