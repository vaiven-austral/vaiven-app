#!/usr/bin/env bash
# Arma las credenciales de n8n y el workflow de main apuntando a la nube.
# Sin VM: los deja en SALIDA (por defecto ~/secretos-vaiven/n8n-import) para subirlos a mano y correr cargar-en-n8n.sh.
# Con VM: los copia por gcloud y corre cargar-en-n8n.sh allá.
# Se corre desde la laptop, en la raíz de vaiven-app actualizada (git pull en main). No modifica el repo.
#
# Variables (obligatorias las cinco primeras):
#   SUPABASE_URL              https://<ref>.supabase.co
#   SUPABASE_PUBLISHABLE_KEY  la clave publicable (sb_publishable_...) del proyecto
#   MOTOR_TOKEN_FILE          archivo con el token de motor_matching que firmó la Tech Lead
#   MOTOR_SECRET_FILE         archivo con el secreto del aviso (el mismo que está en Vault)
#   VERTEX_SA_FILE            JSON de la service account del modelo
#   VM                        opcional: nombre de la VM;  ZONE (por defecto southamerica-east1-a)
#   IAP=1                     entrar por el túnel de IAP (recomendado);  SSH_PORT sólo si sshd escucha en otro puerto
#   WORKFLOW                  por defecto, el matching-v<N>.json de mayor versión
set -euo pipefail
: "${SUPABASE_URL:?}" "${SUPABASE_PUBLISHABLE_KEY:?}" "${MOTOR_TOKEN_FILE:?}" "${MOTOR_SECRET_FILE:?}" "${VERTEX_SA_FILE:?}"
ZONE="${ZONE:-southamerica-east1-a}"
P="${SSH_PORT:-22}"
X=""; [ -n "${IAP:-}" ] && X="--tunnel-through-iap"
WORKFLOW="${WORKFLOW:-$(ls n8n/workflows/matching-v*.json | sort -V | tail -1)}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
umask 077
TMP="${SALIDA:-$HOME/secretos-vaiven/n8n-import}"; mkdir -p "$TMP"
curl -fsS "$SUPABASE_URL/auth/v1/.well-known/jwks.json" > "$TMP/jwks.json"

python3 -I - "$TMP" "$WORKFLOW" <<'PY'
import base64, json, os, re, sys
tmp, wf_path = sys.argv[1:3]
e = os.environ
d = lambda s: base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))
leer = lambda var: open(e[var]).read().strip()

# Clave pública ES256 vigente del proyecto, en PEM. Va primero en el JWKS.
k = [k for k in json.load(open(f"{tmp}/jwks.json"))["keys"] if k.get("crv") == "P-256"][0]
der = bytes.fromhex("3059301306072a8648ce3d020106082a8648ce3d030107034200") + b"\x04" + d(k["x"]) + d(k["y"])
pem = base64.b64encode(der).decode()
pem = "-----BEGIN PUBLIC KEY-----\n" + "\n".join(pem[i:i + 64] for i in range(0, len(pem), 64)) + "\n-----END PUBLIC KEY-----"
sa = json.load(open(e["VERTEX_SA_FILE"]))

# Mismos id que referencia el workflow de main.
creds = [
    {"id": "n1r2lsGvjJ6hKHbh", "name": "JWT Auth account", "type": "jwtAuth",
     "data": {"keyType": "pemKey", "publicKey": pem, "privateKey": "", "algorithm": "ES256"}},
    {"id": "pXWs8h4SLpvFIt30", "name": "Header Auth - motor-juicio", "type": "httpHeaderAuth",
     "data": {"name": "x-motor-secret", "value": leer("MOTOR_SECRET_FILE")}},
    {"id": "Quzn6tIDeSCxvzxJ", "name": "Header Auth - motor_matching REST", "type": "httpHeaderAuth",
     "data": {"name": "Authorization", "value": "Bearer " + leer("MOTOR_TOKEN_FILE")}},
    {"id": "rptrVertexSA00001", "name": "Google Service Account Vertex", "type": "googleApi",
     "data": {"email": sa["client_email"], "privateKey": sa["private_key"]}},
]

# El JSON de main apunta al stack local: URL y clave publicable se reemplazan en la copia, nunca en el repo.
wf = open(wf_path).read()
wf = wf.replace("http://host.docker.internal:54321", e["SUPABASE_URL"].rstrip("/"))
wf = re.sub(r"sb_publishable_[A-Za-z0-9_-]+", e["SUPABASE_PUBLISHABLE_KEY"], wf)
assert "host.docker.internal" not in wf and "127.0.0.1" not in wf, "quedó una URL local en el workflow"
print("URLs reemplazadas:", wf.count(e["SUPABASE_URL"].rstrip("/")))
json.dump(creds, open(f"{tmp}/creds.json", "w"))
open(f"{tmp}/wf.json", "w").write(wf)
PY

rm -f "$TMP/jwks.json"
if [ -z "${VM:-}" ]; then
  echo "Archivos listos en $TMP: subí creds.json y wf.json a la VM y corré cargar-en-n8n.sh. Después borralos de acá."
  exit 0
fi
gcloud compute scp $X --zone="$ZONE" --scp-flag="-P $P" "$TMP/creds.json" "$TMP/wf.json" "$AQUI/cargar-en-n8n.sh" "$VM":~/
rm -f "$TMP/creds.json" "$TMP/wf.json"
gcloud compute ssh $X "$VM" --zone="$ZONE" --ssh-flag="-p $P" --command="bash ~/cargar-en-n8n.sh && rm ~/cargar-en-n8n.sh"
