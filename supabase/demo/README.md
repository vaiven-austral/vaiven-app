# Demo «La compu para estudiar»

Una PC de escritorio donada contra cinco pedidos de compu que compiten, dos de ellos cabeza a cabeza. Sirve para mostrar cómo el motor
de matching (Gemini en Vertex AI) distingue entre pedidos parecidos y explica su juicio.

Con un solo comando se rehace todo el estado de la demo en la base local:

```bash
bash supabase/demo/preparar-demo.sh
```

> **Cuidado:** el script hace un `supabase db reset`. **Borra la base local.**

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `preparar-demo.sh` | Rehace todo con un comando (receta de `supabase/seed.sql`, caso, fotos y verificación) |
| `caso-compu-para-estudiar.sql` | Las 6 publicaciones del caso y el ajuste de los perfiles de la mamá y del donante |
| `subir-fotos.sh` | Sube las fotos al Storage local y las asocia a sus publicaciones |
| `fotos/` | Las 7 fotos. **No están en el repo** (ver más abajo) |

El caso va **aparte** de `supabase/seed.sql` a propósito: la Action del reporter de KPIs carga esa semilla, y
agregarle publicaciones cambiaría los valores que mide el reporter.

## Requisitos

- Docker Desktop encendido (esperá a que diga «Engine running»; tarda cerca de un minuto después de reiniciar).
- `pnpm install` hecho en la raíz del repo, y `jq` y `sqlite3` instalados.
- Un n8n con el motor, armado **una sola vez** (ver «Primera vez»).
- Las fotos copiadas en `supabase/demo/fotos/` (ver «Las fotos»). Sin ellas la demo funciona, pero sin imágenes.

## Primera vez: armar el n8n con el motor

El motor corre en un n8n local que guarda su workflow y la credencial del modelo en `n8n-data/`. Esa carpeta
**no está en git**, y cada persona arma la suya.

1. Pedile a dirección el JSON de la service account de Vertex y exportalo en tu terminal.
   **Nunca** lo pegues en el repo, en un commit ni en un canal compartido:
   ```bash
   export VERTEX_SA_JSON="$(cat /ruta/a/tu/service-account.json)"
   ```
2. Armá el n8n con el motor. El script viene con el reporter de KPIs (SCRUM-128) y levanta Supabase, n8n y el
   workflow del motor:
   ```bash
   bash reporter-kpis/stack.sh demo
   ```
3. Cuando termine con `juicios: 99`, ya tenés `n8n-data/`. Los pasos de «Cada vez» alcanzan de ahí en más.

Si todavía no tenés `reporter-kpis/stack.sh` (el PR del reporter no está en `main`), traelo de la rama
`SCRUM-128-reporter-kpis`.

## Cada vez

```bash
bash supabase/demo/preparar-demo.sh
```

Tarda unos 3 a 4 minutos y termina con `Estado de la demo OK`. Si algo falla, se puede volver a correr.
Después, para ver la demo:

```bash
pnpm dev
```

y abrí la app en dos navegadores, uno por usuario.

## Los usuarios (contraseña de todos: `vaiven123`)

| Usuario | Papel en la demo |
|---|---|
| `usuario-b@vaiven.dev` | **Dev 1, el donante.** Su PC es la donación. Mira la lista de compatibles y recarga cuando la mamá sube su foto |
| `usuario-a@vaiven.dev` | **Dev 2, la mamá necesitada.** Pide una compu para su hija de 14 años. **Arranca sin foto de perfil y la sube en vivo** |
| `usuario-f@vaiven.dev` | Pedido rival, cabeza a cabeza con el de la mamá: compu para un hijo que entra a la facultad. No inicia sesión |
| `usuario-c@vaiven.dev` | Pedido que compite: PC gamer. No inicia sesión |
| `usuario-d@vaiven.dev` | Pedido que compite: notebook táctil para diseño. No inicia sesión |
| `usuario-e@vaiven.dev` | Pedido que compite: notebook para series y pelis. No inicia sesión |

## Qué tendrías que ver

Los puntajes los calcula el motor, así que pueden variar un poco si cambia el modelo. El script los imprime al
final. Con los datos actuales:

| Pantalla | Resultado |
|---|---|
| Dev 1, «Ver compatibles» de la PC (antes de la foto) | Rival (facultad) **95** primero, mamá **93** segunda, y después Ocio **50**, Diseño **48** y Gamer **45** (ámbar) |
| Dev 1, después de que la mamá sube su foto y se recarga | Mamá **98** primera, rival **95** segundo: la mamá pasa al primer lugar |
| Dev 2, «Ver compatibles» de su pedido | La PC con **88** (verde); el siguiente apenas pasa de 30 |

El rango verde empieza en 70, el ámbar en 40 y el rojo es menor a 40. El paso de la foto de perfil: Dev 2 (la mamá)
sube su foto en Editar perfil (JPG o PNG, hasta 5 MB). Eso suma 5 puntos de confianza a su pedido y Dev 1 lo ve al
recargar. Para repetir el momento hay que volver a dejar a la mamá sin foto: lo más simple es correr de nuevo
`preparar-demo.sh`.

## Las fotos

Las 7 fotos no se suben al repo porque algunas tienen marca de agua o logos de terceros. Pedile la carpeta
`fotos/` a quien armó la demo (llega como zip) y descomprimila en `supabase/demo/`:

```bash
cd supabase/demo && unzip fotos-demo.zip
```

Tiene que quedar `supabase/demo/fotos/` con estos archivos:

| Archivo | Va en |
|---|---|
| `donacion-0-equipo-completo.jpg` | La PC donada (foto principal) |
| `donacion-1-equipo-19-pulgadas.jpg` | La PC donada |
| `donacion-2-monitor.jpg` | La PC donada |
| `pedido-gamer-pc-rgb.jpg` | Pedido gamer |
| `pedido-diseno-tableta-con-lapiz.jpg` | Pedido de diseño |
| `pedido-ocio-notebook-en-la-cama.jpg` | Pedido de ocio |
| `pedido-estudiante-facultad.jpg` | Pedido rival de la facultad (hoy es una copia de la del pedido de ocio: se puede cambiar por otra) |

Si falta alguna, `subir-fotos.sh` lo avisa y sigue sin esa foto. Se puede probar con otra carpeta:
`FOTOS_DIR=/otra/carpeta bash supabase/demo/subir-fotos.sh`.

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| «Docker no responde» | Encendé Docker Desktop y esperá a «Engine running» |
| «Falta n8n-data/» | Hacé la «Primera vez» |
| n8n no levanta | `docker logs n8n`. Si la red de Docker cambió, el script lo recrea solo con los mismos datos |
| El conteo de `juicios` no llega a 99, o hay donaciones sin juzgar | El motor tardó más que el tope de espera: volvé a correr el script |
| `net._http_response` con `status_code` vacío | Es normal en una máquina lenta: `pg_net` espera 5 s y n8n tarda más con muchos avisos juntos. Los juicios se generan igual |
| El puntaje de algún pedido cambió | El modelo no responde siempre igual. El script avisa si la PC deja de ser el primer match de la mamá |
