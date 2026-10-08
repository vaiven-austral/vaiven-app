"""Arma las credenciales locales de n8n y el workflow a importar. Lo entrega dirección: no se edita.

Uso: credenciales.py <jwt_secret_local> <secreto_aviso> <jwks.json> <matching-v2.json> <carpeta_n8n>
Escribe <carpeta_n8n>/creds.json y <carpeta_n8n>/wf.json. Si VERTEX_SA_JSON está definida, agrega la
credencial del modelo y apunta a ella los nodos de Vertex del workflow.
"""
import base64, hashlib, hmac, json, os, sys

jwt_secret, secreto, jwks, wf_path, out = sys.argv[1:6]
b = lambda x: base64.urlsafe_b64encode(x).rstrip(b"=")
d = lambda s: base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

# Clave pública ES256 del Auth local, en PEM.
k = [k for k in json.load(open(jwks))["keys"] if k.get("crv") == "P-256"][0]
der = bytes.fromhex("3059301306072a8648ce3d020106082a8648ce3d030107034200") + b"\x04" + d(k["x"]) + d(k["y"])
pem = base64.b64encode(der).decode()
pem = "-----BEGIN PUBLIC KEY-----\n" + "\n".join(pem[i:i + 64] for i in range(0, len(pem), 64)) + "\n-----END PUBLIC KEY-----"

# Token del rol del motor, HS256 con el secreto local.
h = b(b'{"alg":"HS256","typ":"JWT"}')
p = b(b'{"iss":"supabase-demo","role":"motor_matching","exp":1794711600}')
tok = (h + b"." + p + b"." + b(hmac.new(jwt_secret.encode(), h + b"." + p, hashlib.sha256).digest())).decode()

creds = [
    {"id": "n1r2lsGvjJ6hKHbh", "name": "JWT Auth account", "type": "jwtAuth",
     "data": {"keyType": "pemKey", "publicKey": pem, "privateKey": "", "algorithm": "ES256"}},
    {"id": "pXWs8h4SLpvFIt30", "name": "Header Auth - motor-juicio (local)", "type": "httpHeaderAuth",
     "data": {"name": "x-motor-secret", "value": secreto}},
    {"id": "Quzn6tIDeSCxvzxJ", "name": "Header Auth - motor_matching REST (local)", "type": "httpHeaderAuth",
     "data": {"name": "Authorization", "value": "Bearer " + tok}},
]

wf = json.load(open(wf_path))
vertex = [n for n in wf.get("nodes", []) if n.get("type", "").endswith("lmChatGoogleVertex")]
sa = os.environ.get("VERTEX_SA_JSON", "").strip()
if not vertex:
    print("AVISO: el workflow de main no trae el nodo de Vertex: el motor no va a poder juzgar", file=sys.stderr)
elif not sa:
    print("AVISO: falta VERTEX_SA_JSON: el motor no va a poder juzgar", file=sys.stderr)
else:
    sa = json.loads(sa)
    creds.append({"id": "rptrVertexSA00001", "name": "Vertex (reporter)", "type": "googleApi",
                  "data": {"email": sa["client_email"], "privateKey": sa["private_key"]}})
    for n in vertex:
        n.setdefault("credentials", {})["googleApi"] = {"id": "rptrVertexSA00001", "name": "Vertex (reporter)"}

json.dump(creds, open(os.path.join(out, "creds.json"), "w"))
json.dump(wf, open(os.path.join(out, "wf.json"), "w"))
