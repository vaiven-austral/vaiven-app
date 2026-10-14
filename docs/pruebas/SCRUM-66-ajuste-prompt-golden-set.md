# SCRUM-66 · Prueba de una frase en el prompt contra el golden set

**Decisión: la frase se descarta.** No llega a 28 coincidencias y cambia un par que ya coincidía. El workflow no se modifica.

## 1. Objetivo

Probar **una sola** frase en el prompt del motor (nodo `Basic LLM Chain`) para ver si corrige los dos pares donde el motor baja un match perfecto de 4 a 3, y adoptarla solo si el acuerdo con el golden set sube sin perder ningún par que ya coincidía (regla de adopción del ticket: `coinciden ≥ 28` y ningún par de los 27 previos cambia).

## 2. Frase probada

> Una salvedad solo baja el nivel a 3 si le impide a la persona usar lo que pidió; si la necesidad ya la admite o no exige más que lo básico, el nivel es 4.

Se agregó entre las anclas y la instrucción «Devolvé el nivel junto con su justificación…». Las anclas quedan textuales. No se usaron ejemplos del golden set.

## 3. Cómo se midió

- **Workflow:** `n8n/workflows/matching-v3.json` (motor con Google Vertex Chat Model, SCRUM-135). Se probaron dos variantes idénticas salvo por la frase; el repo no se modificó.
- **Modelo:** `gemini-3.1-flash-lite` por Vertex, Region `global`, `temperature` 0, `thinkingBudget` 0. Se verificó en la tabla `juicios` (columna `modelo`) que las cuatro corridas usaron ese modelo, con `version_scoring = 'v1'`.
- **Procedimiento por corrida:** n8n y `n8n-data/` borrados, `bash reporter-kpis/stack.sh demo` y luego `bash reporter-kpis/stack.sh golden`, importando el workflow con `WORKFLOW_MOTOR`. El reporter importa el workflow desde el archivo, así que mide la variante exacta.
- **Corridas (intercaladas):** base 1, frase 1, base 2, frase 2.
- **Consulta del paso 4 del ticket:**

```sql
select count(*) filter (where j.nivel = r.nivel) as coinciden, count(*) as total
from referencia_golden_set r
join juicios j using (donacion_id, necesidad_id);
```

- El golden set y la tabla `referencia_golden_set` no se modificaron.

## 4. Resultados

| Corrida | Variante | Coinciden |
|---|---|---|
| 1 | Base (sin frase) | **27 / 31** |
| 2 | Con frase | **27 / 31** |
| 3 | Base (sin frase) | **27 / 31** |
| 4 | Con frase | **27 / 31** |

Con `temperature` 0 el motor es **determinista**: las dos corridas base son idénticas par por par, y las dos corridas con frase también. Las diferencias entre base y frase se deben a la frase y no al azar. La línea de base (27/31, con los mismos cuatro pares que fallan) coincide con la del ticket.

### Pares que cambian con la frase

| Par | Referencia | Base | Con frase | Efecto |
|---|---|---|---|---|
| Notebook usada → Notebook o compu para estudiar | 4 | 3 | **4** | ✅ arregla un par objetivo |
| Notebook usada → Algo para que mi hijo pueda estudiar | 3 | 3 | **4** | ❌ rompe un par que coincidía |

Neto: +1 − 1 = 0. El otro par objetivo (*Cuadernos, lápices y mochilas → Útiles escolares*, referencia 4) **no se mueve**: sigue en 3.

### Los 31 pares (base = corridas 1 y 3; frase = corridas 2 y 4)

| Donación | Necesidad | Ref | Base | Con frase | Efecto |
|---|---|---|---|---|---|
| Bicicleta rodado 26 | Bici para ir a trabajar | 3 | 3 | 3 |  |
| Bicicleta rodado 26 | Cama o colchón de una plaza | 0 | 0 | 0 |  |
| Bicicleta rodado 26 | Cochecito o moisés | 0 | 0 | 0 |  |
| Bicicleta rodado 26 | Herramientas básicas | 0 | 0 | 0 |  |
| Bicicleta rodado 26 | Silla de ruedas para mi mamá | 0 | 0 | 0 |  |
| Cuadernos, lápices y mochilas | Abrigo y frazadas | 0 | 0 | 0 |  |
| Cuadernos, lápices y mochilas | Algo para que mi hijo pueda estudiar | 4 | 4 | 4 |  |
| Cuadernos, lápices y mochilas | Libros de primaria para el comedor | 1 | 1 | 1 |  |
| Cuadernos, lápices y mochilas | Ropa para nene de 12 años | 0 | 0 | 0 |  |
| Cuadernos, lápices y mochilas | Útiles escolares | 4 | 3 ❌ | 3 ❌ |  |
| Libros para adultos | Algo para que mi hijo pueda estudiar | 2 | 1 ❌ | 1 ❌ |  |
| Libros para adultos | Heladera | 0 | 0 | 0 |  |
| Libros para adultos | Libros de primaria para el comedor | 1 | 1 | 1 |  |
| Libros para adultos | Notebook o compu para estudiar | 0 | 0 | 0 |  |
| Libros para adultos | Útiles escolares | 1 | 1 | 1 |  |
| Notebook usada | Algo para que mi hijo pueda estudiar | 3 | 3 | 4 ❌ | ❌ rompe |
| Notebook usada | Cama o colchón de una plaza | 0 | 0 | 0 |  |
| Notebook usada | Libros de primaria para el comedor | 1 | 1 | 1 |  |
| Notebook usada | Notebook o compu para estudiar | 4 | 3 ❌ | 4 | ✅ arregla |
| Notebook usada | Ventilador | 0 | 0 | 0 |  |
| Notebook usada | Útiles escolares | 1 | 1 | 1 |  |
| Ropa de bebé 0 a 3 meses | Abrigo y frazadas | 0 | 0 | 0 |  |
| Ropa de bebé 0 a 3 meses | Botines de seguridad talle 43 | 0 | 0 | 0 |  |
| Ropa de bebé 0 a 3 meses | Cochecito o moisés | 2 | 1 ❌ | 1 ❌ |  |
| Ropa de bebé 0 a 3 meses | Libros de primaria para el comedor | 0 | 0 | 0 |  |
| Ropa de bebé 0 a 3 meses | Ropa para nene de 12 años | 0 | 0 | 0 |  |
| Silla de ruedas | Bici para ir a trabajar | 0 | 0 | 0 |  |
| Silla de ruedas | Cama o colchón de una plaza | 0 | 0 | 0 |  |
| Silla de ruedas | Lavarropas | 0 | 0 | 0 |  |
| Silla de ruedas | Silla de ruedas para mi mamá | 4 | 4 | 4 |  |
| Silla de ruedas | Útiles escolares | 0 | 0 | 0 |  |

## 5. Por qué se descarta

1. **No llega a 28.** El resultado con frase es 27/31, igual que la línea de base.
2. **Cambia un par que ya coincidía.** *Notebook usada → Algo para que mi hijo pueda estudiar* coincidía con la referencia (3) y con la frase pasa a 4. Viola la segunda condición de la regla de adopción.
3. **El efecto es reproducible, no ruido.** Las dos corridas con frase dan exactamente el mismo resultado, así que el trade-off (arregla uno, rompe otro) es propio de la frase.
4. **No resuelve el segundo par objetivo.** *Cuadernos → Útiles escolares* sigue en 3.

Según el ticket, una frase que no sube el acuerdo sin perder pares se descarta y el KPI se informa con el prompt actual.

## 6. Hallazgo para QA: la premisa del ticket no se verifica

El ticket describe los dos pares objetivo como un match perfecto al que el modelo le encuentra «una salvedad que el texto no dice». Al leer los textos y las justificaciones, el modelo **no inventa** la salvedad: cita un detalle que sí está en el texto, pero que la persona que pide ya aceptaba.

| Par | Detalle que el modelo penaliza | Lo que dice la necesidad |
|---|---|---|
| Notebook usada → Notebook o compu | Batería que no dura: hay que usarla enchufada (dicho en la donación) | «busco notebook o compu aunque sea vieja» |
| Cuadernos, lápices y mochilas → Útiles escolares | `cantidad` 1 contra 2 niñas | «lo basico, lo q tengan» |

Además, el prompt actual **le indica** al modelo que pondere ese tipo de diferencias: pide evaluar «su estado, su tamaño y su cantidad», y el ancla 3 define como salvedad menor «talle, estado o cantidad». El modelo se comporta como se le pidió, y una frase que dice «ignorá las salvedades que no impiden el uso» entra en tensión con esas instrucciones. Eso explica por qué la frase arregla el caso de la batería (donde la necesidad dice «aunque sea vieja») pero también sube el par *Notebook → Algo para que mi hijo pueda estudiar*, donde la referencia sí considera que la salvedad importa.

Justificación del modelo con la frase aplicada, para el par que sube a 4 (pierde coincidencia):

> «Aunque la batería requiere conexión eléctrica permanente, esto no impide el uso funcional del equipo para tareas escolares…»

## 7. Variantes exploradas (a pedido del equipo, no forman parte de este cambio)

En la daily se pidió explorar, además de la frase del ticket, posibles mejoras de prompt para subir el acuerdo con el golden set. Se probaron cuatro variantes con las mismas reglas:

- Se definieron **antes** de ver cualquier resultado y se corrió cada una **una sola vez** (con `temperature` 0 la respuesta del modelo es determinista).
- No se retocó ninguna después de ver su resultado: hacerlo sería ajustar el prompt a estos 31 pares.
- Anclas textuales, sin ejemplos ni frases del golden set, y sin ajustar para los pares 2 → 1.
- Mismo procedimiento y mismo workflow de la sección 3; solo cambia el texto del prompt.

| Corrida | Coinciden |
|---|---|
| Base (sin cambios) | 27 / 31 |
| v1 | 26 / 31 |
| **v2** | **28 / 31** |
| v3 | 25 / 31 |
| v4 | 25 / 31 |

### v1 · El modelo juzga en abstracto; conviene fijar el punto de vista de quien pide.

- **Cambio:** Reemplaza la pregunta central por una desde el punto de vista de quien pide.
- **Texto nuevo:** «Tu única pregunta es: ¿quien pide se daría por satisfecho con este objeto, tal como lo describe quien lo dona?, considerando su estado, su tamaño y su cantidad.»
- **Resultado:** 26/31.

| Par | Ref | Base | Variante | Efecto |
|---|---|---|---|---|
| Libros para adultos → Útiles escolares | 1 | 1 | 0 | ❌ rompe |

### v2 · Falta un criterio explícito para decidir entre 3 y 4.

- **Cambio:** Agrega un párrafo después de las anclas.
- **Texto nuevo:** «Para decidir entre 3 y 4: elegí 3 solo si hay una diferencia de estado, talle o cantidad que la persona no admite en su propia descripción y que le dificulta usar lo que pidió. Si la persona ya expresó flexibilidad sobre ese aspecto, no cuenta como diferencia.»
- **Resultado:** 28/31.

| Par | Ref | Base | Variante | Efecto |
|---|---|---|---|---|
| Notebook usada → Notebook o compu para estudiar | 4 | 3 | 4 | ✅ arregla |

### v3 · El modelo no separa lo imprescindible de lo flexible en la necesidad.

- **Cambio:** Agrega un párrafo después de las anclas.
- **Texto nuevo:** «Antes de asignar el nivel, identificá en la descripción de la necesidad qué es imprescindible y qué es flexible. Una diferencia en algo flexible no baja el nivel.»
- **Resultado:** 25/31.

| Par | Ref | Base | Variante | Efecto |
|---|---|---|---|---|
| Bicicleta rodado 26 → Bici para ir a trabajar | 3 | 3 | 2 | ❌ rompe |
| Libros para adultos → Útiles escolares | 1 | 1 | 0 | ❌ rompe |

### v4 · La mención a «tamaño y cantidad» en el criterio central induce la penalización.

- **Cambio:** Quita «su tamaño y su cantidad» de la pregunta central.
- **Texto nuevo:** «Tu única pregunta es: ¿este objeto resuelve esta necesidad?, considerando su estado.»
- **Resultado:** 25/31.

| Par | Ref | Base | Variante | Efecto |
|---|---|---|---|---|
| Bicicleta rodado 26 → Bici para ir a trabajar | 3 | 3 | 2 | ❌ rompe |
| Ropa de bebé 0 a 3 meses → Abrigo y frazadas | 0 | 0 | 1 | ❌ rompe |

### Lectura

- **v2 es la única que mejora:** 28/31 y ningún par de los 27 que coincidían cambia. Cumple las dos condiciones de la regla de adopción. Arregla *Notebook usada → Notebook o compu para estudiar* sin romper *Notebook usada → Algo para que mi hijo pueda estudiar*, que era lo que rompía la frase del ticket. Condiciona la regla a lo que la persona admite en su propia descripción en vez de pedir ignorar salvedades.
- **v2 no arregla el segundo par objetivo:** *Cuadernos, lápices y mochilas → Útiles escolares* sigue en 3.
- **v4 queda refutada:** sacar «tamaño y cantidad» del criterio no arregla Cuadernos y empeora otros pares, así que la penalización por cantidad no viene solo de esa mención.
- **v1 y v3 empeoran** el resultado (26 y 25).

### Qué no se puede concluir

- **Sesgo de selección:** se probaron cinco candidatos (la frase del ticket y estas cuatro) contra los mismos 31 pares y se destaca el mejor. Con una diferencia de un par, v2 podría no generalizar; que el modelo sea determinista asegura que la respuesta se repite, no que la mejora valga fuera de este conjunto.
- **Alcance del ticket:** el ticket permite una sola frase y v2 agrega un párrafo de dos oraciones. Decidir si eso entra le corresponde a QA o dirección.

### Ideas no probadas (hipótesis, no resultados)

- **Orden del esquema de salida:** en el Structured Output Parser, `nivel` figura antes que `justificacion`; con `thinkingBudget` 0, el modelo no tiene espacio para razonar antes de fijar el nivel. Cambiarlo toca el flujo, que el ticket excluye.
- **`thinkingBudget` mayor a 0:** puede mejorar el juicio a costa de latencia; lo fijó SCRUM-135 en 0 y es decisión de dirección.
- **Ejemplos fuera del golden set** (few-shot): permitido por el ticket, pero con riesgo de sobreajuste y de sesgar el resto de los pares.

## 8. Limitaciones

- **Tamaño del golden set:** 6 donaciones y 31 pares. Un solo par es ~3 puntos de acuerdo; conclusiones sobre una frase se apoyan en muy pocos casos.
- **Riesgo de sobreajuste:** cualquier ajuste del prompt guiado por este conjunto puede mejorar el número sin mejorar el comportamiento general. El ticket indica que el golden set no se toca después de ver resultados; una mejora debería validarse con un conjunto no visto (por ejemplo, los casos difíciles de dirección).
- **Mediciones previas con temperatura por defecto:** una primera tanda (workflow de Vertex sin `temperature` ni `thinkingBudget` en el nodo) dio 26 y 27 de 31 en dos corridas base, y 26 de 31 en dos corridas con la frase: el mismo trade-off, pero con ruido. Se repitió todo con la configuración definitiva de `main` (`temperature` 0, `thinkingBudget` 0), que es la que se reporta arriba.
- **Una sola frase en la prueba del ticket:** por regla del ticket no se probaron otras redacciones como parte de la decisión; las variantes de la sección 7 son una exploración aparte, pedida por el equipo.
- **Los pares 2 → 1** (*Ropa de bebé → Cochecito o moisés*, *Libros para adultos → Algo para que mi hijo pueda estudiar*) no se tocan, como indica el ticket.

## 9. Cómo reproducirlo

```bash
# con VERTEX_SA_JSON y GH_TOKEN exportadas
docker rm -f n8n; rm -rf n8n-data
WORKFLOW_MOTOR=<ruta al workflow a probar> bash reporter-kpis/stack.sh demo
WORKFLOW_MOTOR=<ruta al workflow a probar> bash reporter-kpis/stack.sh golden
```

y luego la consulta del paso 4 de la sección 3. `WORKFLOW_MOTOR` lo soporta `stack.sh` en la rama `SCRUM-128-reporter-kpis`; sin la variable se importa el `matching-v<N>.json` más reciente.
