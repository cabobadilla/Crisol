# ADR-006 — Cloudflare Workers para Crisol

- **Estado:** aceptado (2026-10-07) — **reemplaza a ADR-005**
- **Decide:** el Arquitecto, con una dirección del PO
- **Reemplaza a:** `ADR-005-pages-etapa1-cloudflare-etapa2.md` (superado)

## Por qué se revisa una decisión de hace horas

No es un cambio de opinión: **cambió la premisa**. `ADR-005` eligió Pages porque la
Etapa 1 se verificó **estática** (un archivo, cero llamadas de red, sin bindings) y la
regla era «estático → Pages». El PO precisó el rumbo:

> *«tenemos que meter lógica de negocio y validaciones en las páginas, dado esto y que
> esta app será agéntica (con soporte de agentes en cada etapa), creo que es correcto
> desplegarla en Cloudflare»*

## Qué de esa premisa aguanta y qué no

**Lo que NO mueve la plataforma — y hay que decirlo, porque la razón importa:**

- **«Lógica de negocio y validaciones en las páginas».** Validar en el navegador es JS
  del cliente. El artefacto sigue siendo **estático**: no hay código en el servidor.
  Si ésta fuera la razón, la conclusión correcta seguiría siendo Pages — y aceptarla
  mal llevaría a flip-flopear cada vez que aparezca o desaparezca una validación.

**Lo que SÍ la mueve:**

1. **El agente necesita runtime.** Llamar a un modelo exige una **key**, y una key en
   el navegador es una key **pública**. No hay forma de poner un agente real en un
   sitio estático. El producto **va hacia ahí** — no la Etapa 1, pero el producto sí.
2. **La URL de preview por rama es un requisito ya declarado** (`v0.25`: el PO es
   remoto). En Pages se resolvió con un truco: publicar el ciclo en una **ruta** del
   mismo sitio, con **~45 s de propagación** y varios 404 hasta que aparece (medido:
   3 × 404 antes del primer 200). **Workers Builds da una Preview URL por rama,
   nativa.** El requisito existía; la plataforma que lo cumple de fábrica es Cloudflare.
3. **El costo dejó de ser una incógnita.** El token está configurado y **probado**
   (`Workers Scripts: Edit` funcionó en un deploy real), y `deploy.sh` ya despliega y
   verifica. Lo que en `ADR-002` era «administrar por nada» ahora es «ya está hecho».

## Decisión

**Crisol se despliega en Cloudflare Workers, forma A: solo-assets, sin `main`.**

Hoy el artefacto sigue siendo estático — el Worker **no ejecuta código**, así que los
requests son gratis e ilimitados y **no se toca la cuota**. Cuando entre el agente
(Etapa 2), pasa a forma B: se agrega `main` **sin cambiar de plataforma**.

**La decisión se toma para el producto destino, no para el artefacto de hoy.** Eso es
deliberado y tiene costo: un token, una cuenta y un `wrangler.jsonc` que Pages no pedía.
Se paga a cambio de no migrar, y de tener previews por rama desde el ciclo 1.

## Alternativas descartadas

- **Pages para Etapa 1 y migrar después** (`ADR-005`): obliga a una migración que se
  sabe que va a ocurrir, y deja la revisión remota dependiendo de una ruta y de la
  propagación del CDN en vez de una URL por rama.
- **Pages + un Worker aparte solo para el agente**: dos plataformas, dos despliegues,
  dos URLs y CORS entre ellas — para terminar con un solo producto.
- **Dejar el agente fuera del alcance del producto**: contradice la dirección del PO
  («soporte de agentes en cada etapa»). El agente no es un extra: es el eje.

## Consecuencias

- **`ADR-002` vuelve a estar vigente en el fondo** (worker solo-assets), y esto se
  declara: el recorrido fue real y **no fue en vano** — produjo el **criterio**
  («¿qué hace el artefacto en runtime?») que ahora da Cloudflare **por una razón**, no
  por costumbre.
- `docs/` deja de estar en la raíz publicada: ya no queda accesible por accidente
  (el 200 que tenía en Pages).
- **La vista robusta del ciclo es una Preview URL de rama**, no una ruta.
- El token de Cloudflare **se usa desde ahora**, y no solo en la Etapa 2.
- **La FORMA del wizard cambia en el mismo ciclo** (corrección del PO: barra
  horizontal, no pila vertical) — ver `HU-1` y los casos `C-01`, `C-03`, `C-04`,
  `C-86`, `C-87`.

## Cómo se verifica

- `C-50`..`C-56` (config del Worker, comandos, superficie publicable, sin credenciales)
- `C-01`/`C-03`/`C-04` — **geometría**: los 7 pasos en una fila
- `C-86`/`C-87` — **umbral** a 390 px
