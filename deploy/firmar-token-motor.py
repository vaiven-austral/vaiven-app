"""Firma el token del rol motor_matching para la nube. Lo corre el dev de datos, en su laptop, apenas crea el proyecto.

Uso: python3 -I firmar-token-motor.py <archivo-con-legacy-jwt-secret> > token-motor
El secreto se lee de un archivo (nunca por argumento: quedaría en el historial) y no se guarda en ningún lado.
El token vence el 15/11/2026 23:59 (ART).
"""
import base64, hashlib, hmac, json, sys

b = lambda x: base64.urlsafe_b64encode(x).rstrip(b"=")
secreto = open(sys.argv[1]).read().strip().encode()
h = b(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
p = b(json.dumps({"role": "motor_matching", "exp": 1794797940}, separators=(",", ":")).encode())
print((h + b"." + p + b"." + b(hmac.new(secreto, h + b"." + p, hashlib.sha256).digest())).decode())
